package com.kiit.nersentinel.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.kiit.nersentinel.data.repository.IncidentRepository

class ReportViewModelFactory(
    private val repository: IncidentRepository
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(
        modelClass: Class<T>
    ): T {

        if (modelClass.isAssignableFrom(ReportViewModel::class.java)) {

            @Suppress("UNCHECKED_CAST")
            return ReportViewModel(repository) as T
        }

        throw IllegalArgumentException(
            "Unknown ViewModel class"
        )
    }
}
