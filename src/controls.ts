import { Vector2 } from "three";

const BUTTON_MAPPING = [
    'pad-up',
    'pad-down',
    'pad-left',
    'pad-right',
    'start',
    'back',
    'trigger-left',
    'trigger-right',
    'left-bumper',
    'right-bumper',
    'power',
    'a',
    'b',
    'x',
    'y',
]


export class Controls {
    _current_gamepad: Gamepad | null = null;
    _keys_pressed: Record<string, boolean> = {};
    axis_horizontal_left: number = 0;
    axis_vertical_left: number = 0;
    axis_vertical_right: number = 0;
    axis_horizontal_right: number = 0;
    axis_trigger_left: number = 0;
    axis_trigger_right: number = 0;
    _buttons_pressed: Record<string, { pressed: boolean, value: number }> = {};

    constructor() {
        window.addEventListener("gamepadconnected", e => this.handel_pad_disconnected(e));
        window.addEventListener("gamepaddisconnected", e => this.handel_pad_connected(e));
        window.addEventListener('keydown', e => this.handel_key_down(e));
        window.addEventListener('keyup', e => this.handel_key_up(e));
    }
    poll_controller() {
        if (this._current_gamepad) {
            this.axis_horizontal_left = this._current_gamepad.axes[0];
            this.axis_vertical_left = this._current_gamepad.axes[1];
            this.axis_vertical_right = this._current_gamepad.axes[2];
            this.axis_horizontal_right = this._current_gamepad.axes[3];
            this.axis_trigger_left = this._current_gamepad.buttons[6].value;
            this.axis_trigger_right = this._current_gamepad.buttons[7].value;

            for (let i = 0; i < this._current_gamepad.buttons.length; i++) {
                const button_name = BUTTON_MAPPING[i];
                const button = this._current_gamepad.buttons[i];

                if (!(button_name in this._buttons_pressed)) {
                    this._buttons_pressed[button_name] = { pressed: false, value: 0 };
                }

                if (this._buttons_pressed?.[button_name].pressed && !button.pressed) {
                    console.log(`Released ${button_name}`)
                }
                if (!this._buttons_pressed?.[button_name].pressed && button.pressed) {
                    console.log(`Pressed ${button_name}`)
                }
                this._buttons_pressed[button_name].pressed = button.pressed;
                this._buttons_pressed[button_name].value = button.value;

            }
        } else {
            let gamepads = navigator.getGamepads();
            if (gamepads.length > 0) {
                this._current_gamepad = gamepads[0];
            }
        }
    }

    handel_pad_connected(e: GamepadEvent) {
        console.log(e.gamepad)
        this._current_gamepad = e.gamepad;
    }
    handel_pad_disconnected(e: GamepadEvent) {
        console.log("TODO: Handle Gamepad Disconnected;")
        console.log(e.gamepad)
    }
    handel_key_down(e: KeyboardEvent) {
        this._keys_pressed[e.key] = true;
    }
    handel_key_up(e: KeyboardEvent) {
        delete this._keys_pressed[e.key];
    }

    is_key_down(key: string): boolean {
        return this._keys_pressed[key];
    }

    get_left_axes(): Vector2 {
        let result = new Vector2(0,0);
        if (this._current_gamepad) {
            result = new Vector2(
                -this.axis_horizontal_left,
                -this.axis_vertical_left
            );
        }
        if (this._keys_pressed["a"]) {
            result.x -= 1;
        }
        if (this._keys_pressed["d"]) {
            result.x += 1;
        }
        if (this._keys_pressed["w"]) {
            result.y += 1;
        }
        if (this._keys_pressed["s"]) {
            result.y -= 1;
        }
        return result;
    }

    get_trigger_axis(): number {
        let result = 0;
        if (this._current_gamepad) {
            result = this.axis_trigger_left-this.axis_trigger_right;
        }
        if(this._keys_pressed["q"]){
            result += 1;
        }
        if(this._keys_pressed["e"]){
            result -= 1;
        }
        return result
    }

}