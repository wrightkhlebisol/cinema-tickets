import TicketService from "../../../src/pairtest/TicketService.js";
import InvalidPurchaseException from '../../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from "../../../src/pairtest/lib/TicketTypeRequest.js";


describe('Ticket Service', () => {
    let ticketService;

    beforeAll(() => {
        ticketService = new TicketService()
    })

    describe('Test Validations', () => {

        test('should throw when userId and request are undefined', () => {
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

        // HAPPY PATHS
        test('should be successful for adult, child and infant request', () => {
            expect(ticketService.purchaseTickets(1, [new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('ADULT', 1)])).toBeTruthy()

        })

        test('should be successful for adult and child request', () => {
            expect(ticketService.purchaseTickets(1, [new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('ADULT', 1)])).toBeTruthy()

        })

        test('should be successful for adult and infant request', () => {
            let response = ticketService.purchaseTickets(1, [new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('ADULT', 1)])
            expect(response).toBeTruthy()
            expect(response).toHaveProperty("amount");
            expect(response).toHaveProperty("quantity");
            expect(response).toHaveProperty("seats");

        })

        test('should return the correct amount and price for infant and adult request', () => {
            let { quantity, amount, seats } = ticketService.purchaseTickets(1, [new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('ADULT', 1)])
            expect(quantity).toEqual(2);
            expect(amount).toEqual(2000);
            expect(seats).toEqual(1);
        })

        test('should return the correct amount and price for child and adult request', () => {
            let { quantity, amount, seats } = ticketService.purchaseTickets(1, [new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('ADULT', 1)])
            expect(quantity).toEqual(2);
            expect(amount).toEqual(3000);
            expect(seats).toEqual(2);
        })

        test('should return the correct amount and price for infant, child and adult request', () => {
            let { quantity, amount, seats } = ticketService.purchaseTickets(1, [new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('CHILD', 1), new TicketTypeRequest('ADULT', 1)])
            expect(quantity).toEqual(3);
            expect(amount).toEqual(3000);
            expect(seats).toEqual(2);
        })
    })
})

describe("External service", () => {
    test("should be called when ticket service does not throw", () => {
        // let ticketPaymentService = new TicketPaymentService();
        const ticketPaymentService = { makePayment: (accountId, amount) => { } }
        const seatReservationService = { reserveSeat: (accountId, totalSeatsToAllocate) => { } };

        jest.spyOn(ticketPaymentService, 'makePayment')
        jest.spyOn(seatReservationService, 'reserveSeat')

        let ticketService = new TicketService(
            ticketPaymentService,
            seatReservationService,
        );

        ticketService.purchaseTickets(5, [new TicketTypeRequest('ADULT', 1)])

        expect(ticketPaymentService.makePayment).toBeCalledWith(5, 2000);
    });

    test("should not be called when ticket service throws", () => {
        const ticketPaymentService = { makePayment: (accountId, amount) => { } }
        const seatReservationService = { reserveSeat: (accountId, totalSeatsToAllocate) => { } };

        jest.spyOn(ticketPaymentService, 'makePayment')
        jest.spyOn(seatReservationService, 'reserveSeat')

        let ticketService = new TicketService(
            ticketPaymentService,
            seatReservationService,
        );

        expect(() => ticketService.purchaseTickets(5, [new TicketTypeRequest('ADULT', 0), new TicketTypeRequest('INFANT', 1)])).toThrow()

        expect(ticketPaymentService.makePayment).not.toBeCalled();
        expect(seatReservationService.reserveSeat).not.toBeCalled();

    });
})