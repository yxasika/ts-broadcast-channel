import { Broadcasted } from '../index';

const __testChannels = {
    __numberChannel: 'some-number-channel',
    __voidChannel: 'some-void-channel',
}

class __TestService {
    
    @Broadcasted({ channel: __testChannels.__voidChannel })
    private someBroadcastedMethod(): void {
        return;
    }
    
    @Broadcasted({ channel: __testChannels.__numberChannel })
    private someBroadcastedFunction(a: number, b: number): number {
        return a + b;
    }
    
}



test('Broadcasted', () => {
    
    expect(__TestService.prototype).toMatchSnapshot();
});
