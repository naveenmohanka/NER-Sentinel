package com.kiit.nersentinel.ui.screen

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.location.LocationServices
import com.kiit.nersentinel.data.local.DatabaseProvider
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import com.kiit.nersentinel.ui.components.IncidentOption
import com.kiit.nersentinel.viewmodel.ReportViewModel
import com.kiit.nersentinel.viewmodel.ReportViewModelFactory

@Composable
fun ReportIncidentScreen() {

    val context = LocalContext.current

    val database = remember {
        DatabaseProvider.getDatabase(context)
    }

    val repository = remember {
        IncidentRepository(database.incidentDao())
    }

    val factory = remember {
        ReportViewModelFactory(repository)
    }

    val reportViewModel: ReportViewModel = viewModel(
        factory = factory
    )

    var selectedIncident by remember {
        mutableStateOf<String?>(null)
    }

    var latitude by remember {
        mutableStateOf<Double?>(null)
    }

    var longitude by remember {
        mutableStateOf<Double?>(null)
    }

    var locationStatus by remember {
        mutableStateOf("Location not fetched")
    }

    val fusedLocationClient = remember {
        LocationServices.getFusedLocationProviderClient(context)
    }

    fun fetchLocation() {

        locationStatus = "Fetching location..."

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->

                if (location != null) {
                    latitude = location.latitude
                    longitude = location.longitude
                    locationStatus = "Location fetched successfully"
                } else {
                    locationStatus = "Unable to fetch location"
                }
            }
            .addOnFailureListener {
                locationStatus = "Failed to fetch location"
            }
    }

    val locationPermissionLauncher =
        rememberLauncherForActivityResult(
            contract = ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->

            val fineGranted =
                permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true

            val coarseGranted =
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true

            if (fineGranted || coarseGranted) {
                fetchLocation()
            } else {
                locationStatus = "Location permission denied"
            }
        }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = "Report an Incident",
            style = MaterialTheme.typography.headlineMedium
        )

        Text(
            text = "Help authorities identify hazards and protect your community.",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = "Select Incident Type",
            style = MaterialTheme.typography.titleMedium
        )

        IncidentOption(
            title = "Crack Spotted",
            description = "Visible cracks on slopes or roads",
            selected = selectedIncident == "crack_spotted",
            onClick = {
                selectedIncident = "crack_spotted"
            }
        )

        IncidentOption(
            title = "Slope Movement",
            description = "Ground or slope movement observed",
            selected = selectedIncident == "slope_movement",
            onClick = {
                selectedIncident = "slope_movement"
            }
        )

        IncidentOption(
            title = "Minor Landslide",
            description = "Small debris or soil movement",
            selected = selectedIncident == "minor_landslide",
            onClick = {
                selectedIncident = "minor_landslide"
            }
        )

        IncidentOption(
            title = "Major Landslide",
            description = "Major slope failure or landslide",
            selected = selectedIncident == "major_landslide",
            onClick = {
                selectedIncident = "major_landslide"
            }
        )

        IncidentOption(
            title = "Road Blockage",
            description = "Road blocked due to debris or landslide",
            selected = selectedIncident == "road_blockage",
            onClick = {
                selectedIncident = "road_blockage"
            }
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Location",
            style = MaterialTheme.typography.titleMedium
        )

        OutlinedButton(
            onClick = {

                val fineGranted =
                    ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED

                val coarseGranted =
                    ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED

                if (fineGranted || coarseGranted) {
                    fetchLocation()
                } else {
                    locationPermissionLauncher.launch(
                        arrayOf(
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Get Current Location")
        }

        Text(
            text = locationStatus,
            style = MaterialTheme.typography.bodyMedium
        )

        if (latitude != null && longitude != null) {
            Text(
                text = "Lat: $latitude\nLng: $longitude",
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Button(
            onClick = {

                if (selectedIncident == null) {
                    locationStatus = "Please select an incident type"
                    return@Button
                }

                if (latitude == null || longitude == null) {
                    locationStatus = "Please fetch your location"
                    return@Button
                }

                val report = IncidentReport(
                    deviceId = "phone_001",
                    lat = latitude!!,
                    lng = longitude!!,
                    reportType = selectedIncident!!,
                    timestamp = System.currentTimeMillis(),
                    offlineSynced = false
                )

                reportViewModel.saveIncident(report)

                Log.d(
                    "NER_SENTINEL",
                    "Report saved offline: $report"
                )

                locationStatus = "Report saved offline successfully"
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Submit Report")
        }
    }
}
