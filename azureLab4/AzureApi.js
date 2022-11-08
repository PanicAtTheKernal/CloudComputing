const { NetworkManagementClient } = require("@azure/arm-network");
const { ComputeManagementClient } = require("@azure/arm-compute");
const { DefaultAzureCredential } = require("@azure/identity");
const { config } = require('dotenv');

config();

const subscriptionId = process.env.subscriptionId;
const resourceGroupName = "lerandomrg";
const preferedLocation = "westeurope"


async function createPublicIPAddressAllocationMethod(name) {
  const publicIpAddressName = name;
  const parameters = {
    idleTimeoutInMinutes: 10,
    location: preferedLocation,
    publicIPAddressVersion: "IPv4",
    publicIPAllocationMethod: "Static",
    sku: { name: "Basic" },
  };
  const credential = new DefaultAzureCredential();
  const client = new NetworkManagementClient(credential, subscriptionId);
  const result = await client.publicIPAddresses.beginCreateOrUpdateAndWait(
    resourceGroupName,
    publicIpAddressName,
    parameters
  );
  console.log(result);
}
  
async function createNetworkInterface(name) {
  const networkInterfaceName = name;
  const parameters = {
    ipConfigurations: [
      {
        name: "ipconfig1",
        publicIPAddress: {
          id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/publicIPAddresses/test-ip`,
        },
        subnet: {
          id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/virtualNetworks/test-vnet/subnets/default`,
        },
      },
    ],
    location: preferedLocation,
  };
  const credential = new DefaultAzureCredential();
  const client = new NetworkManagementClient(credential, subscriptionId);
  const result = await client.networkInterfaces.beginCreateOrUpdateAndWait(
    resourceGroupName,
    networkInterfaceName,
    parameters
  );
  console.log(result);
}
  
  async function createACustomImageVMFromAnUnmanagedGeneralizedOSImage(name) {
    const vmName = name;
    const parameters = {
        osProfile: {
          adminUsername: "daniel",
          secrets: [
            
          ],
          computerName: "test-vm",
          linuxConfiguration: {
            ssh: {
              publicKeys: [
                {
                  path: "/home/daniel/.ssh/authorized_keys",
                  keyData: `${process.env.ssh}`
                }
              ]
            },
            disablePasswordAuthentication: true
          }
        },
        networkProfile: {
          networkInterfaces: [
            {
              id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/networkInterfaces/test-nic`,
              properties: {
                primary: true
              }
            }
          ]
        },
        storageProfile: {
          imageReference: {
            publisher: "canonical",
            offer: "0001-com-ubuntu-server-focal",
            sku: "20_04-lts-gen2",
            version: "latest"
        },
          dataDisks: [
            
          ]
        },
        hardwareProfile: {
          vmSize: "Standard_B2s"
      },
      provisioningState: "Creating",
      name: vmName,
      type: "Microsoft.Compute/virtualMachines",
      location: preferedLocation
    };
    const credential = new DefaultAzureCredential();
    const client = new ComputeManagementClient(credential, subscriptionId);
    const result = await client.virtualMachines.beginCreateOrUpdateAndWait(
      resourceGroupName,
      vmName,
      parameters
    );
    console.log(result);
  }
  
  
  createPublicIPAddressAllocationMethod('test-ip').catch(console.error);
  createNetworkInterface("test-nic").catch(console.error);
  createACustomImageVMFromAnUnmanagedGeneralizedOSImage('test-vm').catch(console.error);