import { ReduxStateType } from "../../types";


export interface ISettingState{
    // Troing setting sẽ có bật tắc xác minh 2fa
    login2fa:{
        enabled: boolean;
        status:ReduxStateType;
        error:string;
    },
    // lựa chọn phương thức nhận otp 
    otp:{
        type: "email" | "smart";
        status:ReduxStateType;
        error:string;
    },
    // đổi mật khẩu
    changePassword:{
        status:ReduxStateType;
        error:string;
    },



}