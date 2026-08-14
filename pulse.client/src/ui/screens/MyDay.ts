// Styles
import "../styles/main.css"
import "remixicon/fonts/remixicon.css";

// Components
import { Component, ComponentModel } from "../components/Component";
import { Div} from "../components/Div";
import { Card, CardModel } from "../components/Card";
import { MyDayHeader, MyDayHeaderModel } from "../components/MyDayHeader";
import { HeroArea, HeroAreaModel } from "../components/HeroArea";

// Utils
import * as DateUtils from "../../utils/DateUtils";

export class MyDayScreenModel extends ComponentModel<MyDayScreen> {
    readonly component = MyDayScreen;

    heroAreaVisibleHeight:number;
    heroAreaTotalHeight:number;
    selectedDate:Date; // TODO: Lets make this obsolete and stick to date keys?
    selectedDateKey:DateUtils.DateKey;
    headerModel:MyDayHeaderModel;
    heroAreaModel:HeroAreaModel;
    metricSectionCardModels: CardModel[];
    myDayActionsModel:CardModel;

    constructor(args: {
        heroAreaVisibleHeight:number;
        heroAreaTotalHeight:number;
        selectedDate:Date;
        selectedDateKey:DateUtils.DateKey;
        headerModel:MyDayHeaderModel;
        heroAreaModel: HeroAreaModel;
        metricSectionCardModels: CardModel[];
        myDayActionsModel:CardModel;
    }) {
        super();

        this.heroAreaVisibleHeight = args.heroAreaVisibleHeight;
        this.heroAreaTotalHeight = args.heroAreaTotalHeight;
        this.selectedDate = args.selectedDate;
        this.selectedDateKey = args.selectedDateKey;
        this.headerModel = args.headerModel;
        this.heroAreaModel = args.heroAreaModel;
        this.metricSectionCardModels = args.metricSectionCardModels;
        this.myDayActionsModel  = args.myDayActionsModel;
    }
}

export class MyDayScreen extends Component<MyDayScreenModel> {
        
    private readonly header: MyDayHeader;
    
    private readonly heroArea: HeroArea;
    private readonly heroSpacer: Div;
    
    private readonly content: Div;
    
    private readonly metricSectionCardsContainer:Div;
    private readonly metricSectionCards:Card[];

    private readonly myDayActionsCard: Card;

    constructor() {
        super();

        // The screen container that holds the whole composition
        this.root.className = "screen-container";
        
        // The content inside the screen
        this.content = new Div();
        this.content.className = "content";


        // The header and hero area
        this.header = new MyDayHeader();
        this.header.setContentRoot(this.content);
        
        this.heroArea = new HeroArea();
        this.heroArea.setContentRoot(this.content);
        
        this.heroSpacer = new Div();
        this.heroSpacer.className = "hero-spacer";

        this.metricSectionCards = [];

        this.myDayActionsCard = new Card();

        this.metricSectionCardsContainer = new Div();
        this.metricSectionCardsContainer.className = "metric-cards-section";

        this.content.append(
            this.heroSpacer,
            this.metricSectionCardsContainer,
            this.myDayActionsCard
        );

        this.root.append(
            this.header.root,
            this.heroArea.root,
            this.content.root,
        );

        // enableDaySwipe(container);
        // startAutoSync();
    }

    protected render(): void {
        this.root.style.setProperty('--hero-area-visible-height', `${this.model.heroAreaVisibleHeight}px`);
        this.root.style.setProperty('--hero-area-total-height', `${this.model.heroAreaTotalHeight}px`);

        this.header.update(this.model.headerModel);

        this.heroArea.update(this.model.heroAreaModel);

        // Create missing cards
        while (this.metricSectionCards.length < this.model.metricSectionCardModels.length) {
            const card = new Card();
            this.metricSectionCards.push(card);
            this.metricSectionCardsContainer.append(card);
        }

        // Remove extra cards
        while (this.metricSectionCards.length > this.model.metricSectionCardModels.length) {
            const card = this.metricSectionCards.pop()!;
            card.root.remove();
        }

        // Update existing cards
        this.metricSectionCards.forEach((card, i) => {
            card.update(this.model.metricSectionCardModels[i]);
        });

        this.myDayActionsCard.update(this.model.myDayActionsModel);
    }
}