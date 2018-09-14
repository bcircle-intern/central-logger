import React from "react"
import ReactDOM from "react-dom";
import styled from "styled-components"
import "semantic-ui-css/semantic.min.css"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { Body } from "./components/Body"
import { Login } from "./components/Login"
import AppStorage from "./share/AppStorage"
import { HashRouter, BrowserHistory } from "react-router-dom"

type State = {
    loggedIn: boolean
    styleR: string
    styleL: string
    styleBody: string
}
export class App extends React.Component<{}, State> {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            styleR: "rightTo",
            styleL: "leftTo",
            styleBody: "none",
        }
    }

    public onLogin = (status) => {
        this.setState({
            loggedIn: status
        })
    }
    public onLogout = () => {
        this.setState({ loggedIn: false })
        AppStorage.Logout()
    }
    public onLogoutPlease = () => {
        this.setState({ loggedIn: false })
    }

    public componentDidMount() {
        this.setState({ loggedIn: AppStorage.getAccessToken() !== null })
    }

    public render() {
        let { loggedIn } = this.state
        return (
            this.state.loggedIn ?
                <div>
                    <Header onLogout={this.onLogout} loggedIn={loggedIn} />
                    <Body onLogoutPlease={this.onLogoutPlease} />
                    <Footer />
                </div>
                :
                <div>
                    <Header onLogout={this.onLogout} loggedIn={loggedIn} />
                    <Login onLogin={this.onLogin} />
                    <Footer />
                </div>
        )
    }
}

let root = document.getElementById("root")

const app = (
    <HashRouter history={BrowserHistory}>
        <App />
    </HashRouter>
)
ReactDOM.render(app, root)