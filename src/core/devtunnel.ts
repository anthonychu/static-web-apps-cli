import { TunnelManagementHttpClient } from "@vs/tunnels-management";
import { TunnelAccessControlEntryType, TunnelProtocol, TunnelAccessScopes } from "@vs/tunnels-contracts";
import { TunnelRelayTunnelHost } from "@vs/tunnels-connections";

export async function startDevTunnel(tunnelName: string, tunnelPort: number): Promise<string | undefined> {
  // TODO: log the user in and get the token
  const token = process.env["AZURE_FUNCTIONS_DEV_TUNNEL_TOKEN"] ?? null;

  const manager = new TunnelManagementHttpClient("AzureStaticWebAppsCli/0.0.1", async () => `Bearer ${token}`);

  const tunnels = await manager.listTunnels();
  const existingTunnel = tunnels.find((t) => t.name === tunnelName);
  if (existingTunnel) {
    await manager.deleteTunnel(existingTunnel);
  }

  const tunnel = await manager.createTunnel({
    description: "Tunnel for Azure Static Web Apps CLI",
    name: tunnelName,
    ports: [{ portNumber: tunnelPort, protocol: TunnelProtocol.Auto }],
    accessControl: {
      entries: [
        {
          type: TunnelAccessControlEntryType.Anonymous,
          scopes: [TunnelAccessScopes.Connect],
          subjects: [],
        },
      ],
    },
  });

  const tunnelHost = new TunnelRelayTunnelHost(manager);
  await tunnelHost.start(tunnel);

  const firstEndpoint = tunnel.endpoints?.[0];
  let devTunnelUrl: string | undefined;
  if (firstEndpoint) {
    devTunnelUrl = firstEndpoint.portUriFormat?.replace("{port}", tunnelPort.toString());
  }
  return devTunnelUrl;
}
