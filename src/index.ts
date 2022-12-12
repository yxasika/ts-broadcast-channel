
export type BroadcastChannelOptions = {
    channel: string,
    identifier?: string,
    broadcastOrder?: 'broadcastBefore' | 'broadcastAfter'
};

// FIXME: keeping track of broadcast-channels make sense until you have to handle with multiple onMessage-Events and/or GC.
// const __broadcastChannelsByName: Map<string, BroadcastChannel> = new Map<string, BroadcastChannel>()
//
// function __createBroadcastChannelByConfig(broadcastChannelOptions: BroadcastChannelOptions): BroadcastChannel {
//     let cachedBroadcastChannel = __broadcastChannelsByName.get(broadcastChannelOptions.channel);
//
//     if (cachedBroadcastChannel) return cachedBroadcastChannel;
//
//     cachedBroadcastChannel ??= new BroadcastChannel(broadcastChannelOptions.channel);
//     __broadcastChannelsByName.set(broadcastChannelOptions.channel, cachedBroadcastChannel);
//     return cachedBroadcastChannel;
// }

function __createOnMessage({ target, descriptor, broadcastChannel}: {target: Object, descriptor: TypedPropertyDescriptor<any>, broadcastChannel: BroadcastChannel}) {
    broadcastChannel.onmessage = (event: MessageEvent) => descriptor.value.call(target, ...event.data)
}


export function Broadcasted(
    broadcastChannelOptions: BroadcastChannelOptions
): MethodDecorator {
    const optionsSuppliedWithDefaults: Required<BroadcastChannelOptions> = {
        identifier: '',
        broadcastOrder: 'broadcastBefore',
        ...broadcastChannelOptions
    };
    const usedBroadcastChannel = new BroadcastChannel(optionsSuppliedWithDefaults.channel);
    
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const baseMethod = descriptor.value;
        __createOnMessage({ target, descriptor, broadcastChannel: usedBroadcastChannel });
       
        const [broadcastBefore, broadcastAfter] = optionsSuppliedWithDefaults.broadcastOrder === 'broadcastAfter'
            ? [, (...args: Parameters<typeof baseMethod>) => usedBroadcastChannel.postMessage(args)]
            : [(...args: Parameters<typeof baseMethod>) => usedBroadcastChannel.postMessage(args), ];
        
        descriptor.value = (...args: Parameters<typeof baseMethod>) => {
            broadcastBefore?.(args);
            baseMethod(...args);
            broadcastAfter?.(args);
        };
        
        return descriptor;
    }
}

