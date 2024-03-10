type BoundedSchedule = {
    readonly title: string;
    readonly isWholeDay: false;
    readonly hasGuests: boolean;
    readonly location: string;
    readonly startAt: GoogleAppsScript.Base.Date;
    readonly endAt: GoogleAppsScript.Base.Date;
};

type WholeDaySchedule = {
    readonly title: string;
    readonly isWholeDay: true;
};

type MySchedule = BoundedSchedule | WholeDaySchedule;

function fetchSchedulesAt(calendarId: string, targetDate: Date): Result<MySchedule[]> {
    const calendar = CalendarApp.getCalendarById(calendarId);
    if (calendar === null) {
        return new Failure("Failed to get the calendar by a calendar ID");
    }

    const events = calendar.getEventsForDay(targetDate);
    if (events == null) {
        return new Failure("Failed to get events from the calendar");
    }
    return new Success(events.map(transformEvents));
}

const toJapaneseDay = ["日", "月", "火", "水", "木", "金", "土"];