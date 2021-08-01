import {
  InputChannel,
  KeyboardInputChannel,
  InputChannelType,
} from './inputChannel';

export class InputManager {
  channels: InputChannel<InputChannelType>[] = [];

  constructor() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    requestAnimationFrame(this.update);
  }

  createKeyboardChannel(
    mapping: Map<string, string>,
    bufferSize?: number,
    bufferClearTimeoutMs?: number
  ) {
    const channel = new KeyboardInputChannel(
      mapping,
      bufferSize,
      bufferClearTimeoutMs
    );
    this.channels.push(channel);
    return channel;
  }

  getChannelsForKeyboardInput(e: KeyboardEvent) {
    return this.channels.filter(
      (channel) =>
        channel instanceof KeyboardInputChannel && channel.allowInput(e.code)
    ) as KeyboardInputChannel[];
  }

  onKeyDown = (e: KeyboardEvent) => {
    this.getChannelsForKeyboardInput(e).forEach((channel) =>
      channel.onKeyDown(e)
    );
  };

  onKeyUp = (e: KeyboardEvent) => {
    this.getChannelsForKeyboardInput(e).forEach((channel) =>
      channel.onKeyUp(e)
    );
  };

  update = () => {
    this.channels.forEach((channel) => channel.update());
    requestAnimationFrame(this.update);
  };
}
