import React from "react"
import { Segment, Table, Icon, Header, Dropdown, Modal, Button, Input, Form, Loader } from "semantic-ui-react"
import { ManageItems } from "./ManageItems"
import "react-datepicker/dist/react-datepicker.css";
import { Log, GetEmail } from "../share/LoggerApi"
import "/css/Body.css"
import Switch from "react-switch";
import swal from "sweetalert2"
import * as EmailValidator from "email-validator";

type Props = {
    allApp: any[]
    list: GetEmail[]
    loading: boolean
    // tslint:disable-next-line:variable-name
    onDelete: (string) => void
    // tslint:disable-next-line:variable-name
    // tslint:disable-next-line:variable-name
    onEditSave: (GetEmail: GetEmail) => void
    onNewSave: (GetEmail: GetEmail) => void
}
type State = {
    manage: GetEmail[]
    open: boolean
    checked: boolean
    newApp: string
    newEmail1: string
    newEmail2: string
    newEmail3: string
    newEnable: boolean
}

export class Manage extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            manage: null,
            open: null,
            checked: true,
            newApp: null,
            newEmail1: null,
            newEmail2: null,
            newEmail3: null,
            newEnable: true,
        };
    }
    public onOpens = () => {
        this.setState({ open: true })
    }
    public componentDidMount() {
    }
    private onClose = () => {
        if (this.state.newApp !== null || this.state.newEmail1 !== null || this.state.newEmail2 !== null || this.state.newEmail3 !== null) {
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
                    this.onSave()
                } else {
                    this.setState({ open: false, newEmail1: null, newEmail2: null, newEmail3: null, newEnable: true })
                }
            })
        } else { this.setState({ open: false }) }
    }
    private handleChange = (value) => {
        this.setState({ checked: value, newEnable: value })
    }
    private setApp = (_, { value }) => {
        this.setState({ newApp: value })
    }
    private handleEmail1Change = (_, { value }) => {
        this.setState({ newEmail1: value })
    }
    private handleEmail2Change = (_, { value }) => {
        this.setState({ newEmail2: value })
    }
    private handleEmail3Change = (_, { value }) => {
        this.setState({ newEmail3: value })
    }
    private onSave = () => {
        if (this.state.newApp === null) {
            swal({
                title: "โปรดเลือก Application เพื่อตั้งค่า",
                timer: 1000
            })
        } else if (this.state.newEmail1 === null && this.state.newEmail2 === null && this.state.newEmail3 === null) {
            swal({
                title: "โปรดกรอกอย่างน้อย 1 อีเมล์",
                timer: 1000
            })
        } else if (this.state.newEmail1 !== "" && !EmailValidator.validate(this.state.newEmail1)) {
            swal({
                title: "รูปแบบ email1 ผิดพลาด.",
                timer: 1000
            })
        } else if (this.state.newEmail2 !== null && this.state.newEmail2 !== "" && !EmailValidator.validate(this.state.newEmail2)) {
            swal({
                title: "รูปแบบ email2 ผิดพลาด.",
                timer: 1000
            })
        } else if (this.state.newEmail3 !== null && this.state.newEmail3 !== "" && !EmailValidator.validate(this.state.newEmail3)) {
            swal({
                title: "รูปแบบ email3 ผิดพลาด.",
                timer: 1000
            })
        } else {
            let newManageList: GetEmail = {
                application: this.state.newApp,
                email_1: this.state.newEmail1,
                email_2: this.state.newEmail2,
                email_3: this.state.newEmail3,
                enable: this.state.newEnable
            }
            this.props.onNewSave(newManageList)
            this.setState({ open: false, newEmail1: null, newEmail2: null, newEmail3: null, newEnable: true })
        }

    }
    public render() {
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }
        let enables: boolean = false
        if (this.props.allApp == null || this.props.allApp === []) {
            enables = true
        }
        return (
            <div>
                <Segment.Group>
                    <Segment textAlign="center" inverted color="teal" size="large">
                        <Header as="h2" floated="left">
                            Email
                    </Header>
                        <Icon style={style} size="big" />
                        <Button onClick={this.onOpens} disabled={enables} color="olive" circular icon="plus" floated="right" />
                        <Modal open={this.state.open} >
                            <Modal.Header>เพิ่มรายการใหม่</Modal.Header>
                            <Modal.Content scrolling>
                                <Form>
                                    <Form.Field>
                                        <Icon style={style} size="large" name="box" />
                                        Application :&nbsp;<br /><br />
                                        <Dropdown className="dropdown" placeholder="All Application" closeOnChange selection options={this.props.allApp} onChange={this.setApp} value={this.state.newApp} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="mail" />
                                        First Email :&nbsp;<br /><br /><Input placeholder="Email1..." width={1} onChange={this.handleEmail1Change} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="mail" />
                                        Second Email :&nbsp;<br /><br /><Input placeholder="Email2..." width={1} onChange={this.handleEmail2Change} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="mail" />
                                        Third Email :&nbsp;<br /><br /><Input placeholder="Email3..." width={1} onChange={this.handleEmail3Change} />
                                    </Form.Field>    <Form.Field>
                                        <Icon style={style} size="large" name="power off" />
                                        Enable :&nbsp;<br /><br /><Switch
                                            onChange={this.handleChange}
                                            checked={this.state.checked}
                                            className="react-switch"
                                            id="normal-switch"
                                        />
                                    </Form.Field> </Form>
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
                                            <Table.HeaderCell width={4} textAlign="center">Application</Table.HeaderCell>
                                            <Table.HeaderCell width={3} textAlign="center">Email1</Table.HeaderCell>
                                            <Table.HeaderCell width={3} textAlign="center">Email2</Table.HeaderCell>
                                            <Table.HeaderCell width={3} textAlign="center">Email3</Table.HeaderCell>
                                            <Table.HeaderCell textAlign="center">Status</Table.HeaderCell>
                                            <Table.HeaderCell width={3} textAlign="center">Manage</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {this.props.list.map((x, key) => <ManageItems onDelete={this.props.onDelete} list={x} key={key}
                                            onSave={this.props.onEditSave} />)}
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