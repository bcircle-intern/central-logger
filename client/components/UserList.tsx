import React from "react"
import { Segment, Table, Icon, Header, Dropdown, Modal, Button, Input, Form, Loader, Message } from "semantic-ui-react"
import { ManageItems } from "./ManageItems"
import "react-datepicker/dist/react-datepicker.css";
import { Log, GetEmail, GetUsers } from "../share/LoggerApi"
import "/css/Body.css"
import { User } from "./User"
import { LoggerApi, manage } from "../share/LoggerApi"
import { getApiUrl } from "../share/Configuration"
import Switch from "react-switch";
import swal from "sweetalert2"
import * as EmailValidator from "email-validator";

type Props = {
    loading: boolean
    list: string[]
    // tslint:disable-next-line:variable-name
    onUserChange: (string) => void
    // tslint:disable-next-line:variable-name
    onPassword1Change: (string) => void
    // tslint:disable-next-line:variable-name
    onPassword2Change: (string) => void
    pass1: string
    pass2: string
    onSave: () => void
    // tslint:disable-next-line:variable-name
    onDelete: (string) => void
    user: string

}
type State = {
    open: boolean
    mismatch: boolean
}

export class UserList extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            mismatch: null
        };
    }
    private onOpens = () => {
        this.setState({ open: true })
    }
    private onClose = () => {
        if (this.props.user !== "" || this.props.pass1 !== "" || this.props.pass2 !== "") {
            swal({
                title: "คุณต้องการบันทึกหรือไม่?",
                text: "พบการเปลี่ยนแปลงของข้อมูล",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Save"
            }).then((result) => {
                if (result.value) {
                    this.setState({ mismatch: false })
                    this.onSave()
                } else {
                    this.setState({ open: false })
                    this.props.onUserChange(null)
                    this.props.onPassword1Change("")
                    this.props.onPassword2Change("")
                }
            })
        } else {
            this.props.onUserChange(null)
            this.props.onPassword1Change("")
            this.props.onPassword2Change("")
            this.setState({ open: false })
        }
    }
    private onSave = () => {
        if (this.props.pass1 !== this.props.pass2 || this.props.pass1 === "" || this.props.pass2 === "") {
            this.setState({ mismatch: true })
        } else {
            this.setState({ mismatch: false })
            this.setState({ open: false })
            this.props.onSave()
        }
    }
    private handleUserChange = (_, { value }) => {
        this.props.onUserChange(value)
    }
    private handlePass1Change = (_, { value }) => {
        this.props.onPassword1Change(value)
    }
    private handlePass2Change = (_, { value }) => {
        this.props.onPassword2Change(value)
    }
    public render() {
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }
        return (
            <div>
                <Segment.Group>
                    <Segment textAlign="center" inverted color="olive" size="large">
                        <Header as="h2" floated="left">
                            User
                    </Header>
                        <Icon style={style} size="big" />
                        <Button onClick={this.onOpens} color="green" circular icon="plus" floated="right" />
                        <Modal open={this.state.open} >
                            <Modal.Header>เพิ่มผู้ใช้งาน</Modal.Header>
                            <Modal.Content scrolling>
                                <Form>
                                    <Form.Field>
                                        <Icon style={style} size="large" name="user" />
                                        Username :&nbsp;<br /><br /><Input placeholder="User Here..." width={1} onChange={this.handleUserChange} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="key" />
                                        Password :&nbsp;<br /><br /><Input placeholder="Password..." type="password" width={1} onChange={this.handlePass1Change} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="key" />
                                        Confirm Password :&nbsp;<br /><br /><Input placeholder="Confirm Password..." type="password" width={1} onChange={this.handlePass2Change} />
                                    </Form.Field>
                                </Form>
                                {this.state.mismatch &&
                                    <Message warning
                                        icon="frown outline"
                                        header="รหัสผ่านไม่ตรงกัน."
                                        content="โปรดตรวจสอบอีกครั้ง"
                                    />
                                }
                            </Modal.Content>
                            <Modal.Actions>
                                <Button color="green" floated="right" icon labelPosition="left" onClick={this.onSave}>
                                    <Icon name="save" />
                                    Save
                            </Button>
                                <Button color="red" icon labelPosition="left" onClick={this.onClose}>
                                    <Icon name="cancel" />
                                    Cancel
                            </Button>
                            </Modal.Actions>
                        </Modal>
                    </Segment>
                    <Segment textAlign="center" style={{ minHeight: "calc( 100vh - 230px )" }}>
                        {this.props.loading ?
                            <Loader content="Loading" active={this.props.loading} />
                            :
                            <div className="loglist" style={{ width: "100%" }}>
                                <Table compact>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell width={1} textAlign="center">User</Table.HeaderCell>
                                            <Table.HeaderCell width={1} textAlign="center">Manage</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            this.props.list.map((x, key) => <User list={x} key={key} onDelete={this.props.onDelete} />)
                                        }
                                    </Table.Body>
                                </Table>
                            </div>
                        }

                    </Segment>
                </Segment.Group>
            </div>
        )
    }
}