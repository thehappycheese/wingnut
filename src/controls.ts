


export class Controls {
    connected_gamepads: Array<boolean> = [];
    keysPressed: Record<string, boolean> = {};
    left_up_down_axis:number = 0;
    left_left_right_axis:number = 0;
    right_up_down_axis:number = 0;
    right_left_right_axis:number = 0;
    roll_axis: number = 0;

    constructor() {
        window.addEventListener("gamepadconnected", this.handel_pad_disconnected);
        window.addEventListener("gamepaddisconnected", this.handel_pad_connected);
        window.addEventListener('keydown', this.handel_key_down);
        window.addEventListener('keyup', this.handel_key_up);
    }
    handel_pad_connected(e: GamepadEvent) {
        this.connected_gamepads[e.gamepad.index] = true;
    }
    handel_pad_disconnected(e: GamepadEvent) {
        console.log(e);
    }
    handel_key_down(e: KeyboardEvent) {
        console.log(e);
        this.keysPressed[e.key] = true;
    }
    handel_key_up(e: KeyboardEvent) {
        delete this.keysPressed[e.key];
    }


}