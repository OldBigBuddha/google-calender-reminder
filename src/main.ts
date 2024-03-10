type Env = {
  readonly WEBHOOK_URL: string;
  readonly CALENDAR_ID: string;
};

const GREETING = "おはにゃー♪";
const NO_FORECAST = "今日の天気はわからないにゃ…";

function loadEnv(): Result<Env> {
  const properties = PropertiesService.getScriptProperties();
  const WEBHOOK_URL = properties.getProperty("WEBHOOK_URL");
  const CALENDAR_ID = properties.getProperty("CALENDAR_ID");
  if (!WEBHOOK_URL || !CALENDAR_ID) {
    return new Failure("WEBHOOK_URL or CALENDAR_ID is not set in script properties");
  }

  return new Success({ WEBHOOK_URL, CALENDAR_ID });
}

function main(): void {
  const loadEnvResult = loadEnv();
  if (loadEnvResult.isFailure) {
    console.error(loadEnvResult.value);
    throw new Error("Failed to load environment variables");
  }
  const { WEBHOOK_URL, CALENDAR_ID } = loadEnvResult.value;

  const today = new Date();
  const dayJa = toJapaneseDay[today.getDay()];
  const todayMsg = `今日は${Utilities.formatDate(today, "Asia/Tokyo", "yyyy月MM月dd日")}（${dayJa}）なんだにゃ！`;

  const forecastResult = fetchForecast();
  const forecastMsg = buildForecastMessage(forecastResult);

  const schedulesResult = fetchSchedulesAt(CALENDAR_ID, today);
  if (schedulesResult.isFailure) {
    console.error(schedulesResult.value);
    throw new Error("Failed to fetch schedules");
  }

  const schedules = schedulesResult.value;
  if (schedules.length === 0) {
    const message = `${GREETING}${todayMsg}\n${forecastMsg}\n今日のスケジュールはないからのんびりするにゃ～`;
    notifyToDiscord(WEBHOOK_URL, message, []);
    return;
  }

  const title = `${Utilities.formatDate(today, "Asia/Tokyo", "yyyy-MM-dd")}のスケジュール`;
  const boundeds = schedules.filter(
    (schedule): schedule is BoundedSchedule => !schedule.isWholeDay,
  );
  const wholedays = schedules.filter(
    (schedule): schedule is WholeDaySchedule => schedule.isWholeDay,
  );
  const embed = buildEmbed(
    title,
    `今日は${boundeds.length}件の予定があるんだにゃ～`,
    wholedays,
    boundeds,
  );

  const message = buildMessage(boundeds.length, todayMsg, forecastMsg);
  notifyToDiscord(WEBHOOK_URL, message, [embed]);
}

function buildMessage(boundedsCount: number, todayMsg: string, forecastMsg: string): string {
  const cheerup = boundedsCount > 2 ? "今日は予定がいっぱいだから、むりするんじゃないぞ！" : "";
  return `${GREETING}${todayMsg}${forecastMsg}\n今日のスケジュールを教えるにゃ！${cheerup}`;
}