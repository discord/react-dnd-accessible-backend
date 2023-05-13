import KeyboardBackendFactory, { KeyboardBackend } from "./KeyboardBackend";
import isKeyboardDragTrigger from "./util/isKeyboardDragTrigger";
import {getNodeDescription} from "./util/AnnouncementMessages";

export { KeyboardBackend, isKeyboardDragTrigger, getNodeDescription };

export default KeyboardBackendFactory;
