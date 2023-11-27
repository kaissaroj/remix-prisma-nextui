import { Button } from "@nextui-org/react";
import { Form, useFetcher } from "@remix-run/react";

export default function DashboardIndex() {
  const logoutFetcher = useFetcher();
  const onLogoutPress = () => {
    logoutFetcher.submit(
      { idle: true },
      { method: "post", action: "/api/user/logout" }
    );
  };
  return (
    <div>
      Dashboard
      <Button onClick={() => onLogoutPress()} color="warning">
        Logout
      </Button>
    </div>
  );
}
