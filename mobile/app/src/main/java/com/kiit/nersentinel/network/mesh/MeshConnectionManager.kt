package com.kiit.nersentinel.network.mesh

import android.content.Context
import com.google.android.gms.common.api.Status
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.AdvertisingOptions
import com.google.android.gms.nearby.connection.ConnectionInfo
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback
import com.google.android.gms.nearby.connection.ConnectionResolution
import com.google.android.gms.nearby.connection.ConnectionsClient
import com.google.android.gms.nearby.connection.DiscoveryOptions
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback
import com.google.android.gms.nearby.connection.Payload
import com.google.android.gms.nearby.connection.PayloadCallback
import com.google.android.gms.nearby.connection.PayloadTransferUpdate
import com.google.android.gms.nearby.connection.Strategy

class MeshConnectionManager(
    context: Context
) {

    private val connectionsClient: ConnectionsClient =
        Nearby.getConnectionsClient(context.applicationContext)

    private val strategy =
        Strategy.P2P_CLUSTER

    private val payloadCallback =
        object : PayloadCallback() {

            override fun onPayloadReceived(
                endpointId: String,
                payload: Payload
            ) {
                // Report payload will be handled here
            }

            override fun onPayloadTransferUpdate(
                endpointId: String,
                update: PayloadTransferUpdate
            ) {
                // Transfer progress will be handled here
            }
        }

    private val connectionLifecycleCallback =
        object : ConnectionLifecycleCallback() {

            override fun onConnectionInitiated(
                endpointId: String,
                connectionInfo: ConnectionInfo
            ) {

                connectionsClient.acceptConnection(
                    endpointId,
                    payloadCallback
                )
            }

            override fun onConnectionResult(
                endpointId: String,
                resolution: ConnectionResolution
            ) {

                if (
                    resolution.status.statusCode ==
                    Status.RESULT_SUCCESS.statusCode
                ) {
                    // Connection established
                }
            }

            override fun onDisconnected(
                endpointId: String
            ) {
                // Device disconnected
            }
        }

    fun startAdvertising() {

        val options =
            AdvertisingOptions.Builder()
                .setStrategy(strategy)
                .build()

        connectionsClient.startAdvertising(
            MeshConstants.SERVICE_NAME,
            MeshConstants.SERVICE_ID,
            connectionLifecycleCallback,
            options
        )
    }

    fun startDiscovery() {

        val options =
            DiscoveryOptions.Builder()
                .setStrategy(strategy)
                .build()

        connectionsClient.startDiscovery(
            MeshConstants.SERVICE_ID,
            object : EndpointDiscoveryCallback() {

                override fun onEndpointFound(
                    endpointId: String,
                    info: com.google.android.gms.nearby.connection.DiscoveredEndpointInfo
                ) {

                    connectionsClient.requestConnection(
                        MeshConstants.SERVICE_NAME,
                        endpointId,
                        connectionLifecycleCallback
                    )
                }

                override fun onEndpointLost(
                    endpointId: String
                ) {
                    // Nearby device lost
                }
            },
            options
        )
    }

    fun stopAll() {

        connectionsClient.stopAdvertising()
        connectionsClient.stopDiscovery()
        connectionsClient.stopAllEndpoints()
    }
}
