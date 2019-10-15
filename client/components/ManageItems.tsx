import React from "react"
import { Log, LogLevel, GetEmail } from "../share/LoggerApi";
import { Table, Icon, Form, Modal, Button, SemanticICONS, Input } from "semantic-ui-react"
import "moment/locale/th"
import "/css/Body.css"
import Switch from "react-switch";
import swal from "sweetalert2"

type Props = {
    list: GetEmail
    // tslint:disable-next-line:variable-name
    onDelete: (string) => void
    // tslint:disable-next-line:variable-name
    onSave: (GetEmail: GetEmail) => void
}
type State = {
    status: string
    appName: string
    showEdit: boolean
    checked: boolean
    editApp: string
    editEmail1: string
    editEmail2: string
    editEmail3: string
    editEnable: boolean
}

export class ManageItems extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            status: "",
            appName: "",
            showEdit: false,
            checked: this.props.list.enable,
            editApp: null,
            editEmail1: null,
            editEmail2: null,
            editEmail3: null,
            editEnable: true,
        }
    }
    private handleChange = (value) => {
    }
    public componentDidMount() {
        this.setState({ appName: this.props.list.application })
    }
    private onDelete = () => {
        // console.log(this.props.list.application)
        this.props.onDelete(this.props.list.application)
    }
    private onEdit = () => {
        this.setState({ showEdit: true, editApp: this.props.list.application, editEmail1: this.props.list.email_1, editEmail2: this.props.list.email_2, editEmail3: this.props.list.email_3, editEnable: this.props.list.enable })
    }
    private onClose = () => {
        if (this.state.editEmail1 !== this.props.list.email_1 || this.state.editEmail2 !== this.props.list.email_2 || this.state.editEmail3 !== this.props.list.email_3 || this.state.editEnable !== this.props.list.enable) {
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
                    let editManageList: GetEmail = {
                        application: this.state.editApp,
                        email_1: this.state.editEmail1,
                        email_2: this.state.editEmail2,
                        email_3: this.state.editEmail3,
                        enable: this.state.editEnable
                    }
                    this.props.onSave(editManageList)
                    this.setState({ showEdit: false, editApp: null, editEmail1: null, editEmail2: null, editEmail3: null, editEnable: this.props.list.enable })
                } else {
                    this.setState({ showEdit: false, editApp: null, editEmail1: null, editEmail2: null, editEmail3: null, editEnable: this.props.list.enable })
                }
            })
        } else {
            this.setState({ showEdit: false, editApp: null, editEmail1: null, editEmail2: null, editEmail3: null, editEnable: this.props.list.enable })
        }
    }
    private handleEmail1Edit = (_, { value }) => {
        this.setState({ editEmail1: value })
    }
    private handleEmail2Edit = (_, { value }) => {
        this.setState({ editEmail2: value })
    }
    private handleEmail3Edit = (_, { value }) => {
        this.setState({ editEmail3: value })
    }
    private haddleEnableEdit = (value) => {
        this.setState({ checked: value, editEnable: value })
    }
    private onSave = () => {
        let editManageList: GetEmail = {
            application: this.state.editApp,
            email_1: this.state.editEmail1,
            email_2: this.state.editEmail2,
            email_3: this.state.editEmail3,
            enable: this.state.editEnable
        }
        this.props.onSave(editManageList)
        this.setState({ showEdit: false, editApp: null, editEmail1: null, editEmail2: null, editEmail3: null, editEnable: this.props.list.enable })
    }
    public render() {
        let status: SemanticICONS = "circle"
        switch (this.props.list.enable) {
            case true:
                status = "bell outline"
                break
            case false:
                status = "bell slash outline"
                break
        }
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }
        return (
            this.props.list !== undefined ?
                <Table.Row>
                    <Table.Cell >{this.props.list.application}</Table.Cell>
                    <Table.Cell >{this.props.list.email_1}</Table.Cell>
                    <Table.Cell >{this.props.list.email_2}</Table.Cell>
                    <Table.Cell >{this.props.list.email_3}</Table.Cell>
                    <Table.Cell textAlign="center"><Icon name={status} /></Table.Cell>
                    <Table.Cell textAlign="center">
                        <div>
                            <Button circular icon="pencil" color="green" onClick={this.onEdit} />
                            <Modal open={this.state.showEdit} >
                                <Modal.Header>แก้ไขรายการ {this.props.list.application}</Modal.Header>
                                <Modal.Content scrolling>
                                    <Form>
                                        <Form.Field>
                                            <Icon style={style} size="large" name="box" />
                                            Application :&nbsp;<br /><br />
                                            <Input disabled width={1} defaultValue={this.props.list.application} />
                                        </Form.Field>    <Form.Field>
                                            <Icon style={style} size="large" name="mail" />
                                            First Email :&nbsp;<br /><br /><Input placeholder="Email1..." onChange={this.handleEmail1Edit} width={1} defaultValue={this.props.list.email_1} />
                                        </Form.Field>    <Form.Field>
                                            <Icon style={style} size="large" name="mail" />
                                            Second Email :&nbsp;<br /><br /><Input placeholder="Email2..." onChange={this.handleEmail2Edit} width={1} defaultValue={this.props.list.email_2} />
                                        </Form.Field>    <Form.Field>
                                            <Icon style={style} size="large" name="mail" />
                                            Third Email :&nbsp;<br /><br /><Input placeholder="Email3..." width={1} onChange={this.handleEmail3Edit} defaultValue={this.props.list.email_3} />
                                        </Form.Field>    <Form.Field>
                                            <Icon style={style} size="large" name="power off" />
                                            Enable :&nbsp;<br /><br /><Switch
                                                onChange={this.haddleEnableEdit}
                                                checked={this.state.checked}
                                                className="react-switch"
                                                id="normal-switch"
                                            />
                                        </Form.Field> </Form>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color="green" floated="right" icon labelPosition="left" onClick={this.onSave}>
                                        <Icon name="save" />
                                        บันทึก
                            </Button>
                                    <Button color="red" icon labelPosition="left" onClick={this.onClose}>
                                        <Icon name="cancel" />
                                        ยกเลิก
                            </Button>
                                </Modal.Actions>
                            </Modal>
                            <Button circular icon="trash alternate" color="red" onClick={this.onDelete} />
                        </div>
                    </Table.Cell>
                </Table.Row>
                :
                <div>ไม่พบข้อมูล</div>
        )
    }
}