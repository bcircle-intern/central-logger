import React from "react"
import { Menu } from "semantic-ui-react";
import AppStorage from "../share/AppStorage"
import { Route, Switch, Link, HashRouter, BrowserHistory } from "react-router-dom";

type Props = {
    loggedIn: boolean
    // tslint:disable-next-line:variable-name
    onLogout: (string) => void
}
type State = {
    onUser: boolean
    onManage: boolean
    onChart: boolean
    onMain: boolean
}

export class Header extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            onUser: false,
            onManage: false,
            onChart: false,
            onMain: false,
        }
    }
    public onLogout = () => {
        this.props.onLogout(false)
        AppStorage.Logout()
    }
    public onClickMain = () => {
        this.setState({ onUser: false, onChart: false, onMain: true, onManage: false })
    }
    public onClickChart = () => {
        this.setState({ onUser: false, onChart: true, onMain: false, onManage: false })
    }
    public onClickManage = () => {
        this.setState({ onUser: false, onChart: false, onMain: false, onManage: true })
    }
    public onClickUser = () => {
        this.setState({ onUser: true, onChart: false, onMain: false, onManage: false })
    }
    public render() {
        return (
            this.props.loggedIn ?
                <div >
                    <Menu secondary size="large" icon="labeled" inverted color="blue" >\
                        <Link to="/"><Menu.Item active={this.state.onMain} style={{ paddingLeft: "55px" }} header name="Central Logger ™" onClick={this.onClickMain} /></Link>
                        <Link to="/summary"><Menu.Item active={this.state.onChart} name="Log Chart" onClick={this.onClickChart} /></Link>
                        <Link to="/user"><Menu.Item active={this.state.onManage} name="Manage" onClick={this.onClickManage} /></Link>
                        <Link to="/manage"><Menu.Item active={this.state.onUser} name="User Setting" onClick={this.onClickUser} /></Link>
                        <Menu.Item position="right" name="Logout" onClick={this.onLogout} />
                    </Menu>
                </div>
                :
                <div>
                    <Menu size="large" icon="labeled" inverted color="blue" secondary >\
                    <Menu.Item header name="Central Logger ™" />
                    </Menu>
                </div>
        )
    }
}