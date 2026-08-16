import type { AuthService } from "../services/AuthService";
import type { ExternalAPIMetricsSyncService } from "../services/ExternalAPIMetricsSyncService";
import { ActionButtonModel } from "../ui/components/ActionButton";
import { CardModel } from "../ui/components/Card";
import { CardHeaderModel } from "../ui/components/CardHeader";
import { ICONS } from "../ui/components/ICONS";
import { MetricTextInputFieldModel } from "../ui/components/MetricTextInputField";
import { MeScreen, MeScreenModel } from "../ui/screens/Me";
import { ProfileThumbnailModel } from "../ui/components/ProfileThumbnail";
import type { UserSession } from "../UserSession";
import type { CloudSyncService } from "../services/CloudSyncService";
import type { DeviceMetricsSyncService } from "../services/DeviceMetricsSyncService";
import type { ImageService } from "../services/ImageService";

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

    private readonly userSession:UserSession;
    private readonly authService:AuthService;
    private readonly externalAPIServices:ExternalAPIMetricsSyncService[];
    private readonly cloudSyncService: CloudSyncService;
    private readonly deviceMetricsSyncService: DeviceMetricsSyncService | undefined;
    private readonly imageService: ImageService;

    constructor(
        args: {
            userSession:UserSession,
            authService:AuthService,
            externalAPIServices: ExternalAPIMetricsSyncService[],
            cloudSyncService: CloudSyncService,
            deviceMetricsSyncService?: DeviceMetricsSyncService,
            imageService: ImageService
        }
    ) {
        this.screen = new MeScreen();
        
        this.userSession = args.userSession;
        this.authService = args.authService;
        this.externalAPIServices = args.externalAPIServices;
        this.cloudSyncService = args.cloudSyncService;
        this.deviceMetricsSyncService = args.deviceMetricsSyncService;
        this.imageService = args.imageService;

        this.model = new MeScreenModel({ cards: [] });

        this.cloudSyncService.sync(new Date()); // Kinda weird to pass a date
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
                    onClick: async () => { 
                        await this.login(provider);
                        await this.cloudSyncService.sync(new Date());
                        this.refresh(); 
                    } 
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

        this.externalAPIServices.forEach(element => {
            const extAPIServiceCard: CardModel = new CardModel({ content: [] });
            extAPIServiceCard.content.push(new CardHeaderModel({ title: `${element.name} API Key`, iconClass: ICONS.None }));
            extAPIServiceCard.content.push(new MetricTextInputFieldModel({ 
                placeholderText: "",
                getter: () => element.getAPIKey(),
                setter: (value:string) => element.setAPIKey(value)
            }));            
            this.model.cards.push(extAPIServiceCard);
        });

        const profileCard = new CardModel({ content: [] });

        profileCard.content.push(
            new CardHeaderModel({
                title: "Profile",
                iconClass: ICONS.None
            })
        );

        profileCard.content.push(
            new MetricTextInputFieldModel({
                placeholderText: "Username",
                getter: () => this.userSession.userData.getUserData().displayName ?? "",
                setter: (value: string) =>
                    this.userSession.userData.setDisplayName(value)
            })
        );

        profileCard.content.push(
            new ProfileThumbnailModel(
                {
                    imageUrl: this.userSession.userData.getUserData().profileImage?? ""
                }
            )
        )

        profileCard.content.push(
            new ActionButtonModel({
                iconClass: ICONS.ChooseImage,
                labelStr: "Change Profile Image",
                onClick: async () => {
                    const image = await this.imageService.selectImage();

                    if (!image)
                        return;

                    this.userSession.userData.setProfileImage(image);
                    await this.refresh();
                }
            })
        );

        profileCard.content.push(
            new ActionButtonModel({
                iconClass: ICONS.CloudSync,
                labelStr: "Save to Cloud",
                onClick: () => this.cloudSyncService.sync(new Date())
            })
        );

        this.model.cards.push(profileCard);

        const deviceSyncCard = new CardModel({ content: [] });
        this.model.cards.push(deviceSyncCard);

        deviceSyncCard.content.push(new CardHeaderModel({ title: "Device Sync", iconClass: ICONS.DeviceSync }))

        deviceSyncCard.content.push(new ActionButtonModel({ iconClass: ICONS.Configure, labelStr: "Configure", onClick: () => this.configureDeviceSync() }))

        const appUpdateCard = new CardModel({ content: [] });
        this.model.cards.push(appUpdateCard);
        appUpdateCard.content.push(new CardHeaderModel({ title: "App", iconClass: ICONS.Android }))
        appUpdateCard.content.push(new ActionButtonModel({ iconClass: ICONS.GooglePlayStore, labelStr: "Open Playstore for Updating", onClick: () => this.openPlaystorePage() }))
    }

    async refresh() {
        await this.buildModel();
        await this.screen.update(this.model);
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
    
    configureDeviceSync(): void {
        this.deviceMetricsSyncService?.configure();
    }

    async openPlaystorePage(): Promise<void> {
        window.location.href = "market://details?id=com.pixeldust.pulse"; // TODO: Dont hardcode
    }
}