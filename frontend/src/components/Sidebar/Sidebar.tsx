import { ConversationsProvider } from "../../contexts/ConversationsContext";
import Conversations from "./Conversations";
import Header from "./Header";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";

const Sidebar: React.FC = () => {
    return <div className="min-h-screen bg-ink flex flex-col justify-between">
        <Header />
        <ConversationsProvider>
            <SearchBar />
            <Conversations />
        </ConversationsProvider>
        <UserProfile />
    </div>
}

export default Sidebar;
