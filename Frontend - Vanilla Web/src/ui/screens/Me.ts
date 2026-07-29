import { Card } from "../components/Card";
import { TextLine } from "../components/TextLine";
import * as HEVY from "../../platform/hevy";
import * as AuthController from "../../controllers/AuthController"

let root!: HTMLElement;

// =====================================================
// Mounting
// =====================================================

export async function mount(container: HTMLElement) {
    root = container;
}

export function render(): HTMLElement {
    const screen = document.createElement("div");

    const card = new Card("API Settings");
    screen.append(card.root);

    const textLine = new TextLine(
        "Hevy API Key",
        HEVY.setAPIKey,
        HEVY.getAPIKey
    );

    card.append(textLine.root);

    AuthController.isLoggedIn()
        ? screen.append(renderLoggedIn())
        : screen.append(renderLoggedOut());

    return screen;
}

function renderLoggedOut(): HTMLElement {
    const root = document.createElement("div");

    const card = new Card("Login or Register");
    root.append(card.root);

    const email = document.createElement("input");
    email.type = "email";

    const password = document.createElement("input");
    password.type = "password";

    const register = document.createElement("button");
    register.textContent = "Register";

    const login = document.createElement("button");
    login.textContent = "Login";

    const status = document.createElement("pre");

    register.onclick = async () => {
        try {
            await AuthController.register({
                email: email.value,
                password: password.value
            });

            status.textContent = "Registered!";
        }
        catch (e) {
            status.textContent = String(e);
        }
    };

    login.onclick = async () => {
        try {
            await AuthController.login({ 
                email: email.value, 
                password: password.value });
            // Re-render app
        }
        catch (e) {
            status.textContent = String(e);
        }
        finally {
            rerender();
        }
    };

    card.append(
        email,
        password,
        register,
        login,
        status
    );

    return root;
}

function renderLoggedIn(): HTMLElement {
    const root = document.createElement("div");

    const card = new Card("Logout");
    root.append(card.root);

    const text = document.createElement("p");
    text.textContent = "Logged in";

    const logout = document.createElement("button");
    logout.textContent = "Logout";

    logout.onclick = () => {
        AuthController.logout();
        rerender();
    };

    card.append(text, logout);

    return root;
}

export function rerender() {
    root.replaceChildren(render());
}