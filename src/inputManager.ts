import { InputChannel } from './inputChannel';

export class InputManager {
  channels: Map<string, InputChannel> = new Map();

  constructor() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    requestAnimationFrame(this.update);
  }

  createChannel(
    name: string,
    accepts: string[],
    bufferSize?: number,
    bufferClearTimeoutMs?: number
  ) {
    const channel = new InputChannel(
      name,
      accepts,
      bufferSize,
      bufferClearTimeoutMs
    );
    this.channels.set(name, channel);
    return channel;
  }

  getChannel(name: string) {
    return this.channels.get(name)!;
  }

  getChannelsForInput(e: KeyboardEvent) {
    const channels: InputChannel[] = [];
    this.channels.forEach((channel) => {
      if (channel.accepts(e.code)) {
        channels.push(channel);
      }
    });
    return channels;
  }

  onKeyDown = (e: KeyboardEvent) => {
    this.getChannelsForInput(e).forEach((channel) => channel.onKeyDown(e));
  };

  onKeyUp = (e: KeyboardEvent) => {
    this.getChannelsForInput(e).forEach((channel) => channel.onKeyUp(e));
  };

  update = () => {
    this.channels.forEach((channel) => channel.update());
    requestAnimationFrame(this.update);
  };
}
