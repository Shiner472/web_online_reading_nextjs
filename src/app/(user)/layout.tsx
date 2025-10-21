import HeaderUser from "components/header/User/headerUser";
import FooterUser from "components/footer/User/footerUser";



const LayoutMainPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <HeaderUser />
            <div className="main-container relative top-16 left-0 right-0">
                {children}
            </div>
            <FooterUser />
        </>
    );
};

export default LayoutMainPage;