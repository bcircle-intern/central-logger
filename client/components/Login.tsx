import React, { CSSProperties } from "react";
import { Button, Form, Grid, Header, Message, Icon, Segment } from "semantic-ui-react"
import { getApiUrl } from "../share/Configuration";
import "../css/Animation.css"
import { LoggerApi } from "../share/LoggerApi"
import AppStorage from "../share/AppStorage"

type State = {
    user: string
    password: string
    status: boolean
    visible: boolean
    class: string
    style: string
    render: boolean
}
type Props = {
    // tslint:disable-next-line:variable-name
    onLogin: (string) => void
}

export class Login extends React.Component<Props, State> {
    private LoggerApi = new LoggerApi(getApiUrl());
    constructor(props) {
        super(props);

        this.state = {
            user: "",
            password: "",
            status: null,
            visible: true,
            class: "",
            style: "login",
            render: false
        };
    }
    public handleUserChange = (e) => {
        this.setState({ user: e.target.value })
    }
    public handlePassChange = (e) => {
        this.setState({ password: e.target.value })
    }
    public onLogin = () => {
        this.initLogin(this.state.user, this.state.password)
    }
    private initLogin = (user: string, pass: string) => {
        this.LoggerApi.Login(user, pass).then(res => {
            AppStorage.setAccessToken(res.data.accessToken)
            this.setState({ status: true, style: "out" })
            setTimeout(() => {
                this.setState({ render: true })
            }, 650)
                }).catch(err => {
            if (err.response.status === 401) {
                this.setState({ status: false })
            }
        })
    }
    public render() {
        if (this.state.render) {
            this.props.onLogin(true)
        }

        return (
            <div className={this.state.style} >
                <div className="login-form">
                    <style>{`
              body > div,
              body > div > div,
              body > div > div > div.login-form { }
            `}</style>
                    <Grid textAlign="center" style={{ height: "90vh" }} verticalAlign="middle">
                        <Grid.Column style={{ maxWidth: 450 }}>
                            <Segment inverted color="blue" secondary >
                                <Header as="h2" icon>
                                    <Icon name="eye" />
                                    Central Logger ™
                                    <Header.Subheader>Login to access</Header.Subheader>
                                </Header>
                                {this.state.status === false &&
                                    <Message warning
                                        icon="frown outline"
                                        header="Username or Password is wrong."
                                        content="Please check again"
                                    />
                                }
                                <Form size="large">
                                    <Segment basic>
                                        <Form.Input fluid icon="user" iconPosition="left" placeholder="Username"
                                            onChange={this.handleUserChange} className="" autoFocus />
                                        <Form.Input
                                            fluid
                                            icon="lock"
                                            iconPosition="left"
                                            placeholder="Password"
                                            type="password" onChange={this.handlePassChange}
                                            className=""
                                        />
                                        <Button color="green" fluid size="large" onClick={this.onLogin}>
                                            <Button.Content visible> Login </Button.Content>
                                        </Button>
                                    </Segment>
                                </Form>
                            </Segment>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
        );
    }
}