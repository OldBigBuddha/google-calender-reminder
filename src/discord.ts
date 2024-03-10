type DiscordEmbedField = {
    readonly name: string;
    readonly value: string;
    readonly inline: boolean;
};

type DiscordEmbed = {
    readonly type: "rich";
    readonly title: string;
    readonly description: string;
    readonly color: number;
    readonly fields: DiscordEmbedField[];
    readonly footer?: {
        readonly text: string;
        readonly icon_url: string;
    };
};

function buildEmbed(
    title: string,
    description: string,
    wholedays: WholeDaySchedule[],
    boundeds: BoundedSchedule[],
): DiscordEmbed {
    const wholedayField = {
        name: "終日スケジュール",
        value: wholedays.map((schedule) => `- **${schedule.title}**`).join("\n"),
        inline: false,
    };
    const boundedFields = boundeds.map(transformDiscordEmbedField).flat();
    return {
        type: "rich",
        title: title,
        description: description,
        color: 0x00ff00,
        fields: [wholedayField, ...boundedFields],
    };
}

function formatDate(date: GoogleAppsScript.Base.Date): string {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm");
}

function transformEvents(
    gCalEvent: GoogleAppsScript.Calendar.CalendarEvent,
): MySchedule {
    if (gCalEvent.isAllDayEvent()) {
        return {
            title: gCalEvent.getTitle(),
            isWholeDay: true,
        };
    }

    return {
        title: gCalEvent.getTitle(),
        isWholeDay: false,
        location: gCalEvent.getLocation(),
        hasGuests: gCalEvent.getGuestList().length > 0,
        startAt: gCalEvent.getStartTime(),
        endAt: gCalEvent.getEndTime(),
    };
}

function transformDiscordEmbedField(
    schedule: BoundedSchedule,
): DiscordEmbedField[] {
    const title = schedule.hasGuests ? `${schedule.title} 👥` : schedule.title;
    const hasLocation = schedule.location !== "";
    const main = {
        name: title,
        value: `${formatDate(schedule.startAt)} - ${formatDate(schedule.endAt)}`,
        inline: hasLocation,
    };
    const location = hasLocation
        ? {
            name: "場所",
            value: schedule.location,
            inline: true,
        }
        : undefined;
    const spaceField = hasLocation
        ? {
            name: "\u200b",
            value: "\u200b",
            inline: true,
        }
        : undefined;
    return [main, location, spaceField].filter(
        (field): field is DiscordEmbedField => field != null,
    );
}

function notifyToDiscord(webhookUrl: string, message: string, embeds: DiscordEmbed[]): void {
    UrlFetchApp.fetch(webhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({ content: message, tts: false, embeds: embeds }),
    });
}
