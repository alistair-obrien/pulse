import * as Auth from "../../services/AuthService"
// import { Card } from "../components/Card";

export function render(): HTMLElement {
    return Auth.isLoggedIn()
        ? renderLoggedIn()
        : renderLoggedOut();
}

function renderLoggedOut(): HTMLElement {
    const root = document.createElement("div");

    // const card = new Card("API Settings");
    // root.append(card.root);

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
            await Auth.registerEmail({
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
            await Auth.loginEmail({ 
                email: email.value, 
                password: password.value });
            // Re-render app
        }
        catch (e) {
            status.textContent = String(e);
        }
    };

    // card.append(
    //     email,
    //     password,
    //     register,
    //     login,
    //     status
    // );

    return root;
}

function renderLoggedIn(): HTMLElement {
    const root = document.createElement("div");

    const text = document.createElement("p");
    text.textContent = "Logged in";

    const logout = document.createElement("button");
    logout.textContent = "Logout";

    logout.onclick = () => {
        Auth.logout();

        // Re-render app
    };

    root.append(text, logout);

    return root;
}