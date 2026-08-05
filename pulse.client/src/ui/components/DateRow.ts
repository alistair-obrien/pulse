import { isSameDay } from "../../utils/DateUtils";
import { Component } from "./Component";

export interface DateRowModel {
    date: Date;
    minDate:Date;
    maxDate:Date;
}

// We can either make this generic, or very specialized
export class DateRow extends Component<DateRowModel> {
    
    private dateContainer: HTMLDivElement;
    private weekday: HTMLHeadingElement;
    private dateText: HTMLHeadingElement;
    private prevButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;

    constructor() {
        super();

        this.root.className = "date-row";
        this.root.id = "date-row";

        this.dateContainer = document.createElement("div");
        this.dateContainer.className = "date-row-container";

        this.weekday = document.createElement("h1");
        this.dateText = document.createElement("h2");
        
        this.dateContainer.append(this.weekday, this.dateText);

        this.prevButton = document.createElement("button");
        this.prevButton.className = "icon-button";
        this.prevButton.innerHTML = `
        <svg 
            xmlns="http://www.w3.org/2000/svg"  
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="lucide lucide-chevron-left-icon lucide-chevron-left">
            <path d="m15 18-6-6 6-6"/>
        </svg>`

        this.nextButton = document.createElement("button");
        this.nextButton.className = "icon-button";
        this.nextButton.innerHTML = `
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="lucide lucide-chevron-right-icon lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
            </svg>`


        this.prevButton.onclick = () => this.handlePrevButtonPress();
        this.nextButton.onclick = () => this.handleNextButtonPress();

        this.root.append(this.prevButton, this.dateContainer, this.nextButton);
    }

    onDateChangeRequest?: (
        newDate: Date
    ) => void;

    protected render(): void {
        const weekdayFormatted = new Intl.DateTimeFormat("en-GB", {
            weekday: "long"
        }).format(this.model.date);

        const dateFormatted = new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(this.model.date);
        this.weekday.textContent = weekdayFormatted;
        this.dateText.textContent = dateFormatted;
        this.prevButton.disabled = isSameDay(this.model.date, this.model.minDate);
        this.nextButton.disabled = isSameDay(this.model.date, this.model.maxDate);
    }

    private handlePrevButtonPress() {
        const date = new Date(this.model.date);
        date.setDate(date.getDate() - 1);
        
        this.onDateChangeRequest?.(date);
    }

    private handleNextButtonPress() {
        const date = new Date(this.model.date);
        date.setDate(date.getDate() + 1);
        
        this.onDateChangeRequest?.(date);
    }
}
















// SPOOOOOPY
        // this.prevButton.onclick = async () => {
        //     const date = new Date(this.model.date);
        //     date.setDate(date.getDate() - 1);
        //     await this.transitionToDate(date, "right");
        // };

                // this.nextButton.onclick = async () => {
        //     const next = new Date(this.model.date);
        //     next.setDate(next.getDate() + 1);

        //     if (!isFuture(next)) {
        //         await this.transitionToDate(next, "left");

        //     }
        // };