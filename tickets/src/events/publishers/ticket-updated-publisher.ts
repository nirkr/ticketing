import {Publisher, Subjects, TicketUpdatedEvent} from "@nkticketing/common";

export class ticketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    onPublish(data: TicketUpdatedEvent["data"]): void {
        console.log("ticket-update-publisher.ts: event was published", data);
    }

    readonly subject = Subjects.TicketUpdated
    // subject: TicketUpdatedEvent["subject"] = Subjects.TicketUpdated
}