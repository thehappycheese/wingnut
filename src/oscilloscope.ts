

const colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "grey",
    "black",
]
export class Oscilloscope {
    host:HTMLElement;
    canvas:HTMLCanvasElement;
    var_host:HTMLDivElement;
    var_state:Record<
        string,
        {
            value:number,
            last_value:number,
            color:string,
            icon:HTMLDivElement,
            label:HTMLDivElement,
            output:HTMLDivElement,
            max:number,
            min:number
        }> = {};
    color_assignment_counter:number = 0;
    time_step_state:number = 0;
    constructor (host:HTMLElement){
        this.host = host;
        this.var_host = document.createElement('div');
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 200;
        this.host.appendChild(this.var_host);
        this.host.appendChild(this.canvas);
        this.var_state = {};
        const ctx = this.canvas.getContext('2d')!;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    update_probe(key:string, new_value:number, max:number, min:number){
        if(!(key in this.var_state)){
            const label = document.createElement('div');
            const output = document.createElement('div');
            const icon = document.createElement('div');
            const color = colors[(this.color_assignment_counter++)%colors.length];

            label.textContent = key;
            icon.className = "icon";
            icon.style.backgroundColor = color;
            output.innerText = new_value.toFixed(3);
            this.var_host.appendChild(icon);
            this.var_host.appendChild(label);
            this.var_host.appendChild(output);
            this.var_state[key] = {
                value: new_value,
                last_value: new_value,
                icon,
                label,
                output,
                max,
                min,
                color,
            }
        }
        if(this.var_state[key].value != new_value){
            // update graph and update dom outputs
            this.var_state[key].last_value = this.var_state[key].value;
            this.var_state[key].value = new_value
            this.var_state[key].output.innerText = new_value.toFixed(3);
        }
    }
    update_chart(step:number){
        // update local storage with max seen, min seen
        // update dom
        let ctx = this.canvas.getContext('2d')!;
        this.time_step_state += step;
        if(this.time_step_state > this.canvas.width){
            this.time_step_state -= this.canvas.width;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }
        const previous_x = this.time_step_state-step;

        for (let [_, {value, last_value, color, min, max}] of Object.entries(this.var_state)){
            const transform = (x:number) => (x-min)/(max-min)*this.canvas.height;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(previous_x          , transform(value));
            ctx.lineTo(this.time_step_state, transform(last_value));
            ctx.stroke();
        }
    }
}