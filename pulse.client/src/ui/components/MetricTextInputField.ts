import { Component, ComponentModel } from "./Component";
import { ICONS } from "./ICONS";

export class MetricTextInputFieldModel extends ComponentModel<MetricTextInputField> {
    readonly component = MetricTextInputField;
    readonly placeholderText: string;
    readonly getter: () => string;
    readonly setter: (value: string) => void;

    constructor(args: {
        placeholderText: string, 
        getter: () => string;
        setter: (value: string) => void;
    }) {
        super();

        this.placeholderText = args.placeholderText;
        this.getter = args.getter;
        this.setter = args.setter;
    }
}

export class MetricTextInputField extends Component<MetricTextInputFieldModel> {
    private readonly icon: HTMLElement;
    private readonly textArea: HTMLTextAreaElement;

    //placeholderText: string, metricTypeId: StringMetricTypeId, selectedDateKey: DateKey

    constructor() {
        super();
        this.root.className = "text-area";

        this.icon = document.createElement("i");
        this.icon.className = ICONS.EditTextField;
        this.root.append(this.icon);

        this.textArea = document.createElement("textarea");
        this.root.append(this.textArea);
                
    }
    
    protected render(): void {
        
        this.textArea.placeholder = this.model.placeholderText;
        this.textArea.value = this.model.getter();
        this.textArea.oninput = () => this.model.setter(this.textArea.value);
    }
}