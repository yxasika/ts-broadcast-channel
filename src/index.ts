/**
 * ### clearBroadcastChannelByName
 *
 *
 * The Broadcast-Decorator enables developers to build service-classes that share information between
 * browser-contexts in a clean way.
 *
 *
 */
export type BroadcastChannelOptions = {
  channel: string;
  identifier?: string;
  broadcastOrder?: 'broadcastBefore' | 'broadcastAfter';
};

const trackedBroadcastsByName = new Map<string, BroadcastChannel[]>();

/**
 * ### clearBroadcastChannelByName
 *
 *
 * The Broadcast-Decorator enables developers to build service-classes that share information between
 * browser-contexts in a clean way.
 *
 * This function closes existing Broadcast-Channels and should be regarded as one of the cleanup-routines
 * of the using service-class.
 *
 * @param {string} name
 * @return {boolean}
 */
export function clearBroadcastChannelByName(name: string): boolean {
  trackedBroadcastsByName.get(name)?.forEach((broadcastChannel) => broadcastChannel.close());
  return trackedBroadcastsByName.delete(name);
}

function __createTrackedBroadcastChannel(name: string): BroadcastChannel {
  const createdBroadcastChannel: BroadcastChannel = new BroadcastChannel(name);
  const currentBroadcastChannelsOnName: BroadcastChannel[] = trackedBroadcastsByName.get(name) ?? [];
  trackedBroadcastsByName.set(name, [...currentBroadcastChannelsOnName, createdBroadcastChannel]);
  return createdBroadcastChannel;
}

/**
 * ### BroadcasteOnChannel Decorator
 *
 *
 * The Broadcast-Decorator enables developers to build service-classes that share information between
 * browser-contexts in a clean way.
 *
 * Adding this decorator to a method will emit the provided arguments as message to other active instances
 * in non-accessible browser-contexts if called directly. The other instance will receive a call analogous.
 *
 * _When using this decorator, keep in mind that active BroadcastChannels should always be closed
 * (achieve this by calling `clearBroadcastChannelByName` with the appropriate name)!_
 *
 * @param {BroadcastChannelOptions} broadcastChannelOptions - the configuration Options to be applied.
 * @return {MethodDecorator} - the resulting descriptor.
 * @constructor
 */
export function BroadcasteOnChannel(broadcastChannelOptions: BroadcastChannelOptions): MethodDecorator {
  const optionsSuppliedWithDefaults: Required<BroadcastChannelOptions> = {
    identifier: '',
    broadcastOrder: 'broadcastBefore',
    ...broadcastChannelOptions,
  };

  const usedBroadcastChannel = __createTrackedBroadcastChannel(optionsSuppliedWithDefaults.channel);

  return (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const baseMethod = descriptor.value;

    usedBroadcastChannel.onmessage = (event: MessageEvent) => descriptor.value.call(target, ...event.data);

    const baseMethodCallback = (...args: Parameters<typeof baseMethod>) => baseMethod.call(target, ...args);
    const broadcastCallback = (...args: Parameters<typeof baseMethod>) => usedBroadcastChannel.postMessage(args);

    const [beforeSlot, afterSlot] =
      optionsSuppliedWithDefaults.broadcastOrder === 'broadcastAfter'
        ? [baseMethodCallback, broadcastCallback]
        : [broadcastCallback, baseMethodCallback];

    descriptor.value = (...args: Parameters<typeof baseMethod>) => {
      beforeSlot(args);
      afterSlot(args);
    };

    return descriptor;
  };
}
