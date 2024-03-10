const OFFICE_CODE = "260000"; // 京都府
const AREA_CODE = "260010" // 京都市南部
const FORECAST_URL = `https://www.jma.go.jp/bosai/forecast/data/forecast/${OFFICE_CODE}.json`;

type ForecastByArea = {
    readonly area: {
        readonly name: string;
        readonly code: string;
    };
    readonly weatherCodes: string[];
    readonly weathers: string[];
    readonly winds: string[];
};
type TimeSeries = {
    readonly timeDefines: string[];
    readonly areas: ForecastByArea[];
};

type ForecastResponse = {
    readonly publishingOffice: string;
    readonly reportDatetime: string;
    readonly timeSeries: TimeSeries[];
};

type Weather = {
    readonly weather: string;
    readonly maxTemperature: string;
    readonly minTemperature: string;
};

function fetchForecast(): Result<ForecastResponse> {
    const response = UrlFetchApp.fetch(FORECAST_URL);
    if (response.getResponseCode() !== 200) {
        console.error("Failed to fetch the weather forecast");
        console.error(response.getContentText());
        return new Failure("Failed to fetch the weather forecast");
    }

    const json = JSON.parse(response.getContentText()) as ForecastResponse[];
    return new Success(json[0]);
}

function pickupByAreaCode(response: ForecastResponse, areaCode: string): Result<ForecastByArea> {
    const forecastByArea = response.timeSeries[0].areas.find((area) => area.area.code === areaCode);
    if (forecastByArea === undefined) {
        console.error("Failed to find the forecast by the area code");
        return new Failure("Failed to find the forecast by the area code");
    }

    return new Success(forecastByArea);
}

function buildForecastMessage(forecast: Result<ForecastResponse>): string {
    if (forecast.isFailure) {
        console.error(forecast.value);
        return NO_FORECAST;
    }

    const forecastResponse = forecast.value;
    const areaResult = pickupByAreaCode(forecastResponse, AREA_CODE);
    if (areaResult.isFailure) {
        console.error(areaResult.value);
        return NO_FORECAST;
    }

    const area = areaResult.value;
    const todayWeather = area.weathers[0];
    return `天気は「${todayWeather}」だにゃ！`;
}
