import TicketService from "../../../src/pairtest/TicketService.js";
import InvalidPurchaseException from '../../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from "../../../src/pairtest/lib/TicketTypeRequest.js";
import TicketPaymentService from "../../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../../../src/thirdparty/seatbooking/SeatReservationService.js";


describe('Ticket Service', () => {
    let ticketService;

    beforeAll(() => {
        ticketService = new TicketService()
    })

    describe('Test Validations', () => {

        test('it throws when userId and request are undefined', () => {
            expect(() => ticketService.purchaseTickets()).toThrow()
            expect(() => ticketService.purchaseTickets()).toThrow(InvalidPurchaseException);
            expect(() => ticketService.purchaseTickets()).toThrow("Account ID should be an integer greater than zero")
        })

        test('should throw when userId is null', () => {
            expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest())).toThrow(TypeError);
            expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest())).toThrow("type must be ADULT, CHILD, or INFANT")
        })

        test('should throw when request is null', () => {
            expect(() =>
                ticketService.purchaseTickets(1, null)
            ).toThrow(InvalidPurchaseException);
            expect(() =>
                ticketService.purchaseTickets(1, null)
            ).toThrow("Ticket type is required");
        })

        test('should throw when request array value is null ', () => {
            expect(() => ticketService.purchaseTickets(1, [null])).toThrow()
            expect(() => ticketService.purchaseTickets(1, [null])).toThrow("Ticket type should be a non empty object")
        })
    })
    describe('correct constraints', () => {

        test('should throw when quantity is more than 20', () => {
            expect(() =>
                ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 21))
            ).toThrow(InvalidPurchaseException)
        })

        test('should throw when quantity is less than 1', () => {
            expect(() =>
                ticketService.purchaseTickets(1, [new TicketTypeRequest('ADULT', 0), new TicketTypeRequest('INFANT', 0)])
            ).toThrow(InvalidPurchaseException)
            expect(() =>
                ticketService.purchaseTickets(1, [new TicketTypeRequest('ADULT', -1), new TicketTypeRequest('INFANT', -1)])
            ).toThrow(InvalidPurchaseException)
        })

        test('should throw when child and infant buys without adult', () => {
            expect(() =>
                ticketService.purchaseTickets(1, [new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('ADULT', 0)])
            ).toThrow(InvalidPurchaseException)
        })

        test('should throw when infant is more than adult', () => {
            expect(() =>
                ticketService.purchaseTickets(1, [new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('INFANT', 2), new TicketTypeRequest('ADULT', 1)])
            ).toThrow(InvalidPurchaseException)
        })
    })
})
