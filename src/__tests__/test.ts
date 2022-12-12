import { BroadcasteOnChannel, clearBroadcastChannelByName } from '../index';

const __testChannels = {
  __numberChannel: 'some-number-channel',
  __voidChannel: 'some-void-channel',
};

class __TestService {
  public __voidWasCalled: boolean = false;

  @BroadcasteOnChannel({ channel: __testChannels.__voidChannel })
  private someBroadcastedMethod(): void {
    this.__voidWasCalled = true;
    return;
  }

  public __numberWasCalled: boolean = false;

  @BroadcasteOnChannel({ channel: __testChannels.__numberChannel })
  private someBroadcastedFunction(a: number, b: number): number {
    return a + b;
  }
}

describe('Broadcasted', () => {
  let testee: __TestService;

  beforeEach(() => (testee = new __TestService()));

  test('should not change prototype of class', () => {
    expect(Object.getPrototypeOf(testee)).toMatchSnapshot();
  });

  afterEach(() => {
    clearBroadcastChannelByName(__testChannels.__voidChannel);
    clearBroadcastChannelByName(__testChannels.__numberChannel);
  });
});
