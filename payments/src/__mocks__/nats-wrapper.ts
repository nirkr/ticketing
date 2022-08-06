export const natsWrapper = {
    client: {
        publish: jest.fn() // for our routes to emit actual events to the mocker
            .mockImplementation((subject:string, data: string, callback:() => void) => {
                    callback()
            })
    }
}