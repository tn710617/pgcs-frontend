import {atom} from "recoil";
import {isUserSet} from "../Helpers/authHanders";

const enterSecretModalAtom = atom({
    key: 'enterSecretModalAtom',
    default: !isUserSet()
})
export default enterSecretModalAtom;