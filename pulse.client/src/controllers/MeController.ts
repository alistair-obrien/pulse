import type { AuthService } from "../services/AuthService";
import { ActionButtonModel } from "../ui/components/ActionButton";
import { CardModel } from "../ui/components/Card";
import { CardHeaderModel } from "../ui/components/CardHeader";
import { ICONS } from "../ui/components/ICONS";
import { MeScreen, MeScreenModel } from "../ui/screens/Me";

const loginProvidernNames: Record<string, string> = {
    google: "Google",
    facebook: "Facebook",
};
const loginProviderIcons: Record<string, string> = {
    google: ICONS.GoogleLogin,
    facebook: ICONS.FacebookLogin,
};

export class MeController {
    model:MeScreenModel;
    screen:MeScreen;

    authService:AuthService;

    constructor(
        args: {
            authService:AuthService
        }
    ) {
        this.screen = new MeScreen();
        
        this.authService = args.authService;

        this.model = new MeScreenModel({ cards: [] });

        this.buildModel();
        this.screen.update(this.model);
    }

    private buildModel() {

        this.model = new MeScreenModel({
            cards: [] 
        });

        const cardModel:CardModel = new CardModel({ content: [] });
        this.model.cards.push(cardModel);

        if (!this.authService.isLoggedIn()) {
            cardModel.content.push(new CardHeaderModel({ title: "Logged Out", iconClass: ICONS.LoggedOut }));

            this.authService.availableProviders.forEach(provider => {
                    
                cardModel.content.push(new ActionButtonModel({ 
                    labelStr: `Login with ${loginProvidernNames[provider]}`,
                    iconClass: loginProviderIcons[provider],
                    onClick: async () => this.login(provider)
                }))
            });
        }
        else
        {
            cardModel.content.push(new CardHeaderModel({ title: "Logged In", iconClass: ICONS.LoggedIn }));
            cardModel.content.push(new ActionButtonModel({ 
                labelStr: `Logout`,
                iconClass: ICONS.LogOut,
                onClick: async () => this.logout()
            }));
        }
    }

    async logout() {
        await this.authService.logout();
        this.buildModel();
        this.screen.update(this.model);
    }

    async login(provider: string) {
        await this.authService.login(provider);
        this.buildModel();
        this.screen.update(this.model);
    }
    
    async registerEmail(email:string, password:string) {
        try {
            await this.authService.registerEmail({
                email: email,
                password: password
            });
            this.buildModel();
            this.screen.update(this.model);
        }
        catch (e) {
            console.error(e);
        }
    }
    
    async loginEmail(email:string, password:string) {
        try {
            await this.authService.loginEmail({ 
                email: email, 
                password: password });
            this.buildModel();
            this.screen.update(this.model);
        }
        catch (e) {
            console.error(e);
        }
    }
}
