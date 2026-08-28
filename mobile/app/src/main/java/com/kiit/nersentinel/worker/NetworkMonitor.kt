package com.kiit.nersentinel.worker

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities

class NetworkMonitor(
    private val context: Context
) {

    fun start() {
        val connectivityManager =
            context.getSystemService(
                Context.CONNECTIVITY_SERVICE
            ) as ConnectivityManager

        connectivityManager.registerDefaultNetworkCallback(
            object : ConnectivityManager.NetworkCallback() {

                override fun onAvailable(network: Network) {
                    val capabilities =
                        connectivityManager
                            .getNetworkCapabilities(network)

                    val hasInternet =
                        capabilities?.hasCapability(
                            NetworkCapabilities.NET_CAPABILITY_INTERNET
                        ) == true

                    if (hasInternet) {
                        SyncScheduler.schedule(context)
                    }
                }
            }
        )
    }
}
