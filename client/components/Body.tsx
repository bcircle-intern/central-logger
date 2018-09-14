import React from "react"
import { Loader, Header, Icon, List } from "semantic-ui-react"
import styled from "styled-components"
import moment, { Moment } from "moment"
import "react-datepicker/dist/react-datepicker.css"
import "semantic-ui-css/semantic.min.css";
import "/css/Body.css"
import "../css/Animation.css"
import { getApiUrl } from "../share/Configuration"
import { LoggerApi, Log, GetEmail, GetUsers } from "../share/LoggerApi"
import { LogList } from "./LogList"
import { HubConnectionBuilder } from "@aspnet/signalr";
import { debounce } from "throttle-debounce";
import { Route, Switch, Link } from "react-router-dom";
import { Chart } from "./Chart";
import { Manage } from "./Manage";
import { UserList } from "./UserList"
import swal from "sweetalert2"
import { scaleDown as Menu } from "react-burger-menu"

type Props = {
    onLogoutPlease: () => void
}

const BodyDiv = styled.div`
  flex-direction: column;
  justify-content: center;
  position: absolute;
  width:100%;
  height: 90%;
  padding: 1.5em;
  position: relative;
  min-width: 950px;
`

type State = {
    selectDay: Moment
    endDay: Moment
    startDay: Moment
    noLog: boolean
    allIp: any[]
    allApp: any[]
    selectIp: string
    selectApp: string
    loading: boolean
    items: Log[]
    isLoading: boolean
    cursor: 0
    error: string
    logLenght: number
    newSearch: boolean
    logDate: Log[]
    onChart: boolean
    styleLog: string
    render: boolean
    styleChart: string
    countInfo: number[]
    countError: number[]
    countDebug: number[]
    countTrace: number[]
    countWarning: number[]
    countCritical: number[]
    emailList: GetEmail[]
    allMailApp: any[]
    newApp: string
    newEmail1: string
    newEmail2: string
    newEmail3: string
    newEnable: boolean
    openMenu: boolean
    editApp: string
    editEmail1: string
    editEmail2: string
    editEmail3: string
    editEnable: boolean
    userList: string[]
    newUser: string
    newPassword1: string
    newPassword2: string
}

export class Body extends React.Component<any, State> {
    private LoggerApi = new LoggerApi(getApiUrl());
    private LogDate: Log[]
    private LogNow: Log[]
    private Limit: number

    constructor(props) {
        super(props)
        this.state = {
            allMailApp: [],
            selectDay: moment(),
            endDay: moment().endOf("day"),
            startDay: moment().startOf("day"),
            noLog: true,
            allIp: [],
            allApp: [],
            selectIp: "",
            selectApp: "",
            loading: true,
            items: null,
            isLoading: true,
            cursor: 0,
            error: "",
            logLenght: 0,
            newSearch: false,
            logDate: [],
            onChart: true,
            styleLog: "slideInRight",
            render: null,
            styleChart: "slideInLeft",
            countInfo: null,
            countDebug: null,
            countError: null,
            countTrace: null,
            countWarning: null,
            countCritical: null,
            emailList: [],
            newApp: null,
            newEmail1: null,
            newEmail2: null,
            newEmail3: null,
            newEnable: true,
            openMenu: false,
            editApp: null,
            editEmail1: null,
            editEmail2: null,
            editEmail3: null,
            editEnable: true,
            userList: [],
            newUser: null,
            newPassword1: "",
            newPassword2: ""
        }
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
    }
    public handleStartDateChange = (date) => {
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
        if (date > this.state.endDay) {
            this.setState({
                logDate: [],
                startDay: date,
                endDay: moment(date).endOf("day")
            });
        } else {
            this.setState({ logDate: [], startDay: date })
        }
        this.initSearchByAll(date.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
    }

    public handleEndDateChange = (date) => {
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
        this.setState({ logDate: [], endDay: date, newSearch: true });
        this.initSearchByAll(this.state.startDay.toDate(), date.toDate(), this.state.selectApp, this.state.selectIp)

    }
    private setIP = (value) => {
        this.Limit = 1
        this.setState({ selectApp: null, selectIp: value, allApp: null, newSearch: true }, () => this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, value))
        this.initGetApp(value);
    }
    private OnMore = () => {
        this.setState({ newSearch: false })
        this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
    }

    public setApp = (value) => {
        this.Limit = 1
        this.setState({ selectApp: value, newSearch: true })
        this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), value, this.state.selectIp)
    }
    public setDay = (value) => {
        this.initGetChart(value.toDate())
        this.setState({ selectDay: value })
    }
    public initSearchExceptApp = () => {
        this.LoggerApi.SearchExceptApp().then(res => {
            let options = res.data.map(x => ({ value: x, text: x }))
            this.setState({ allMailApp: options })
        })
    }
    public initmailList = () => {
        this.setState({ loading: true })
        this.LoggerApi.ShowMailApp().then(res => {
            this.setState({ emailList: res.data, loading: false })
        })
    }
    public initUserList = () => {
        this.setState({ loading: true })
        this.LoggerApi.ShowAllUser().then(res => {
            this.setState({ userList: res.data, loading: false })
        })
    }
    public initGetChart = (date: Date) => {
        this.LoggerApi.GetDataChart(date).then(response => {
            this.setState({
                countInfo: response.data.dataInfos, countDebug: response.data.dataDebugs, countError: response.data.dataErrors
                , countTrace: response.data.dataTraces, countCritical: response.data.dataCriticals, countWarning: response.data.dataWarnings
            })
        })
    }
    public componentDidMount() {
        // this.initGetApp(this.state.selectIp)
        this.initGetIp()
        let starts = this.state.startDay
        let end = this.state.endDay
        this.initSearchByAll(starts.toDate(), end.toDate(), this.state.selectApp, this.state.selectIp)
        this.initGetChart(this.state.selectDay.toDate())
        this.initSearchExceptApp()
        this.initUserList()
        this.initmailList()
        this.handleSignalR()
    }
    public initSearchByAll = (startDate: Date, endDate: Date, app: string, ip: string) => {
        this.LogDate = []
        this.LogNow = []
        this.setState({ loading: true })
        this.LoggerApi.SearchLog(startDate, endDate, app, ip, this.Limit).then(response => {
            this.LogDate = response.data.logInfo
            this.setState({ loading: false, logDate: response.data.logInfo, logLenght: response.data.dataLength })
            this.Limit = this.Limit + 1
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
            this.setState({ loading: false })
        })
    }
    public initGetIp = () => {
        this.LoggerApi.getIp().then(response => {
            let options = response.data.map(x => ({ value: x, text: x }))
            options.unshift({ value: "", text: "All IP" });
            this.setState({ allIp: options })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initGetApp = (ip: string) => {
        this.LoggerApi.getApp(ip).then(response => {
            let options = response.data.map(x => ({ value: x, text: x }))
            options.unshift({ value: "", text: "All Application" });
            this.setState({ allApp: options })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    private initDeleteApp = (data: string) => {
        this.LoggerApi.DeleteApp(data).then(response => {
            this.initSearchExceptApp()
            this.initmailList()
        })
            .catch(err => {
                if (err.response.status === 401) {
                    this.props.onLogoutPlease()
                }
            })

    }
    public initAddEmails = (data: GetEmail) => {
        this.LoggerApi.AddEmails(data).then(response => {
            swal("Save!", "Save Complete!", "success");
            this.initmailList()
            this.setState({ newApp: null, newEmail1: null, newEmail2: null, newEmail3: null, newEnable: true })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initUpdateEmail = (data: GetEmail) => {
        this.LoggerApi.UpdateEmail(data).then(response => {
            swal("แก้ไขเรียบร้อย!", "", "success");
            this.initmailList()
            this.setState({ editApp: null, editEmail1: null, editEmail2: null, editEmail3: null, editEnable: null })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initAddUser = (data: GetUsers) => {
        this.LoggerApi.AddUser(data).then(response => {
            swal("บันทึกผู้ใช้เรียบร้อย!", "", "success");
            this.initUserList()
            this.setState({ newUser: null, newPassword1: "", newPassword2: "" })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
            if (err.response.status === 400) {
                swal("ไม่สามารถบันทึกได้!", "มีผู้ใช้ชื่อนี้แล้ว", "error");
            }
        })
    }
    public initDeleteUser = (data: string) => {
        this.LoggerApi.DeleteUser(data).then(response => {
            this.initSearchExceptApp()
            this.initUserList()
        })
            .catch(err => {
                if (err.response.status === 401) {
                    this.props.onLogoutPlease()
                }
            })
    }
    public handleSignalR() {

        const connection = new HubConnectionBuilder()
            // .withUrl("/LogHub")
            .withUrl(`${getApiUrl()}/LogHub`)
            .build();

        connection.onclose((err) => {
            // alert("SignalR เกิดปัญหาการเชื่อมต่อ");
            console.error(err)
        });

        connection.on("LogReceived", (log: Log) => {
            this.LogDate.unshift(log)
            this.updateLogNow();
        });

        connection.start().catch(err => console.error(err.toString()));
    }

    private updateLogNow = debounce(250, () => {
        if (this.LogDate.length >= 150) {
            this.Limit = 1
            this.LogDate = []
            this.setState({ logDate: [], newSearch: true })
            this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
        } else {
            this.setState({ logDate: this.LogDate })
        }
    })
    private onNewUser = (value) => {
        this.setState({ newUser: value })
    }
    private onNewPassword1 = (value) => {
        this.setState({ newPassword1: value })
    }
    private onNewPassword2 = (value) => {
        this.setState({ newPassword2: value })
    }
    private onNewApp = (value) => {
        this.setState({ newApp: value })
    }
    private onNewEmail1 = (value) => {
        this.setState({ newEmail1: value })
    }
    private onNewEmail2 = (value) => {
        this.setState({ newEmail2: value })
    }
    private onNewEmail3 = (value) => {
        this.setState({ newEmail3: value })
    }
    private onNewEnable = (value) => {
        this.setState({ newEnable: value })
    }
    private onEditApp = (value) => {
        this.setState({ editApp: value })
    }
    private onEditEmail1 = (value) => {
        this.setState({ editEmail1: value })
    }
    private onEditEmail2 = (value) => {
        this.setState({ editEmail2: value })
    }
    private onEditEmail3 = (value) => {
        this.setState({ editEmail3: value })
    }
    private onEditEnable = (value) => {
        this.setState({ editEnable: value })
    }
    private onOpenMunu = () => {
        this.setState({ openMenu: false })
    }
    private onNewSave = () => {
        let newManageList: GetEmail = {
            application: this.state.newApp,
            email_1: this.state.newEmail1,
            email_2: this.state.newEmail2,
            email_3: this.state.newEmail3,
            enable: this.state.newEnable
        }
        this.initAddEmails(newManageList);
    }
    private onEditSave = () => {
        let editManageList: GetEmail = {
            application: this.state.editApp,
            email_1: this.state.editEmail1,
            email_2: this.state.editEmail2,
            email_3: this.state.editEmail3,
            enable: this.state.editEnable
        }
        this.initUpdateEmail(editManageList)
    }
    private onSaveUser = () => {
        let newUser: GetUsers = {
            Users: this.state.newUser,
            Password: this.state.newPassword1
        }
        this.initAddUser(newUser)
    }
    private OnDelete = (AppName) => {
        swal({
            title: "ยืนยันการลบการตั้งค่านี้?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ลบ"
        }).then((result) => {
            if (result.value) {
                this.initDeleteApp(AppName)
                swal(
                    "ลบเรียบร้อย!",
                    "",
                    "success"
                )
            }
        })
    }
    private OnDeleteUser = (user) => {
        swal({
            title: "ยืนยันการลบผู้ใช้นี้?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ลบ"
        }).then((result) => {
            if (result.value) {
                this.initDeleteUser(user.toString())
                swal(
                    "ลบเรียบร้อย!",
                    "",
                    "success"
                )
            }
        })
    }

    public render() {
        let allday = moment(this.state.startDay).format("lll").toString() + " ถึง " + moment(this.state.endDay).format("lll").toString()
        let { startDay, endDay, loading, allApp, allIp, selectApp, selectIp, logLenght, newSearch, selectDay,
            countDebug, countError, countInfo, countCritical, countTrace, countWarning, emailList, allMailApp
            , newApp, newEmail1, newEmail2, newEmail3, newEnable, editApp, editEmail1, editEmail2, editEmail3, editEnable
            , userList, newUser, newPassword1, newPassword2 } = this.state
        return (
            <Switch>
                <Route exact path="/" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a" onClick={this.onOpenMunu}>Manage</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User Setting</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">

                                <BodyDiv>
                                    <Loader content="Loading" active={this.state.loading} />

                                    <LogList startDay={startDay} endDay={endDay} logNow={this.LogNow} loading={loading} all={allday}
                                        onStartChange={this.handleStartDateChange} onEndChange={this.handleEndDateChange} allApp={allApp}
                                        allIp={allIp} selectApp={selectApp} selectIp={selectIp} onIpChange={this.setIP} onAppChange={this.setApp}
                                        allData={this.state.logDate} onMore={this.OnMore} logLenght={logLenght} new={newSearch} />
                                </BodyDiv >
                            </main>

                        </div>
                    )
                }} />
                <Route exact path="/summary" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Manage</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User Setting</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <Chart Day={selectDay} onDayChange={this.setDay} info={countInfo} debug={countDebug} error={countError}
                                        trace={countTrace} warning={countWarning} critical={countCritical} />
                                </BodyDiv>
                            </main>
                        </div>
                    )

                }} />
                <Route exact path="/manage" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User Setting</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <Manage allApp={allMailApp} list={emailList} loading={loading}
                                        onAppChange={this.onNewApp} onEmail1Change={this.onNewEmail1} onEmail2Change={this.onNewEmail2}
                                        onEmail3Change={this.onNewEmail3} onEnableChange={this.onNewEnable} onNewSave={this.onNewSave}
                                        newApp={newApp} newEmail1={newEmail1} newEmail2={newEmail2} newEmail3={newEmail3} newEnable={newEnable}
                                        onDelete={this.OnDelete} onAppEdit={this.onEditApp} onEmail1Edit={this.onEditEmail1} onEmail2Edit={this.onEditEmail2}
                                        onEmail3Edit={this.onEditEmail3} onEnableEdit={this.onEditEnable} onEditSave={this.onEditSave}
                                        editEmail1={editEmail1} editEmail2={editEmail2} editEmail3={editEmail3} editEnable={editEnable}
                                        editApp={editApp}
                                    />
                                </BodyDiv>
                            </main>
                        </div>
                    )
                }} />
                <Route exact path="/user" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Manage</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <UserList loading={loading} list={userList} onUserChange={this.onNewUser} onPassword1Change={this.onNewPassword1}
                                        onPassword2Change={this.onNewPassword2} pass1={newPassword1} pass2={newPassword2} onSave={this.onSaveUser}
                                        onDelete={this.OnDeleteUser} user={newUser} />
                                </BodyDiv>
                            </main>
                        </div>
                    )

                }} />
            </Switch>
        )
    }
}