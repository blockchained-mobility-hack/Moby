package com.b3nedikt.moby

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.util.Log
import com.polidea.rxandroidble2.RxBleClient
import com.polidea.rxandroidble2.RxBleDevice
import com.polidea.rxandroidble2.scan.ScanSettings
import io.reactivex.disposables.Disposable
import kotlinx.android.synthetic.main.activity_main.*
import java.util.*


class MainActivity : AppCompatActivity() {

    companion object {
        val TAG = "MainActivity"

        val UUID_TO_WRITE = UUID.fromString("13333333-3333-3333-3333-333333333337")
        val UUID_TO_READ = UUID.randomUUID()

        val UUID_CHARACTERISTIC = UUID.fromString("13333333-3333-3333-3333-333333330002")
    }

    private lateinit var client: RxBleClient

    private lateinit var scanSubscription: Disposable
    private lateinit var deviceConnectionSubsription: Disposable

    private val PERMISSIONS_REQUEST_LOCATION: Int = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        getPermissions()
        client = RxBleClient.create(this)
        //scanForBleDevice()

        val name = nameEditTextView.text
        val birthday = birthdayEditText.text
        val expireDate = expireDateEditText.text
        val driving = drivingCategoryEditText.text
        val licenceNumber = licenceNumberEditText.text
        val city = cityEditText.text

        val address = "L9FOQADXRFNAITMV9HMFYOPPSAVHQWPPEUURXTKORHYBVUFZMLJF9G9NRMUCFING9TRCX9GXWDHYZDURL"

        val json = """
            [{{ "Name":"$name", "Depth": "3"},
        { "Birthday":"$birthday", "Depth":"3"},
        { "ExpireDate":"$expireDate", "Depth":"3"},
        { "Driving":"$driving", "Depth":"3"},
        { "License Number":"$licenceNumber", "Depth":"3"},
        { "City":"$city", "Depth":"3"}},
        { "Address":$address}]
        """

        button.setOnClickListener(
                { startActivity(Intent(this, UnlockActivity::class.java)) })

        connectToDevice()
    }

    private fun getPermissions() {
        if (ContextCompat.checkSelfPermission(this,
                        Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    PERMISSIONS_REQUEST_LOCATION)
        } else {
            // Permission has already been granted
        }
    }

    private fun scanForBleDevice() {
        scanSubscription = client.scanBleDevices(
                ScanSettings.Builder()
                        // .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY) // change if needed
                        // .setCallbackType(ScanSettings.CALLBACK_TYPE_ALL_MATCHES) // change if needed
                        .build()
                // add filters if needed
        ).subscribe(
                { scanResult ->
                    // Process scan result here.
                    Log.wtf(TAG, scanResult.bleDevice.toString())
                },
                { throwable ->
                    throwable.printStackTrace()
                }
        )
    }

    private fun connectToDevice() {

        val macAddress = "B8:27:EB:BC:E2:AB"
        val device = client.getBleDevice(macAddress)

        deviceConnectionSubsription = device.establishConnection(true) // <-- autoConnect flag
                .subscribe(
                        { rxBleConnection ->
                            // All GATT operations are done through the rxBleConnection.

                            val name = nameEditTextView.text
                            val birthday = birthdayEditText.text
                            val expireDate = expireDateEditText.text
                            val driving = drivingCategoryEditText.text
                            val licenceNumber = licenceNumberEditText.text
                            val city = cityEditText.text

                            val address = "L9FOQADXRFNAITMV9HMFYOPPSAVHQWPPEUURXTKORHYBVUFZMLJF9G9NRMUCFING9TRCX9GXWDHYZDURL"

                            val json = """
            [{{ "Name":"$name", "Depth": "3"},
        { "Birthday":"$birthday", "Depth":"3"},
        { "ExpireDate":"$expireDate", "Depth":"3"},
        { "Driving":"$driving", "Depth":"3"},
        { "License Number":"$licenceNumber", "Depth":"3"},
        { "City":"$city", "Depth":"3"}},
        { "Address":$address}]"""

                            Log.wtf(TAG, "Connected")
                            writeToDevice(device, json.toByteArray(Charsets.UTF_8))

                            rxBleConnection.discoverServices().subscribe({ services ->
                                run {

                                    val char = services.getCharacteristic(UUID_CHARACTERISTIC).blockingGet()

                                    rxBleConnection.writeCharacteristic(char, json.toByteArray(Charsets.UTF_8))
                                }
                            })
                        },
                        { throwable ->
                            // Handle an error here.
                            throwable.printStackTrace()
                        }
                )
    }

    private fun onConnectionFinished() {

    }

    private fun onConnectionFailure() {

    }

    private fun writeToDevice(bleDevice: RxBleDevice, bytesToWrite: ByteArray) {

        val writeConnection = bleDevice.establishConnection(false)
                .flatMapSingle({ rxBleConnection -> rxBleConnection.writeCharacteristic(UUID_TO_WRITE, bytesToWrite) })
                .subscribe(
                        { characteristicValue ->
                            // Characteristic value confirmed.
                            Log.w(TAG, characteristicValue.toString())

                        },
                        { throwable ->
                            // Handle an error here.
                        }
                )
    }

    private fun readFromBleDevice(bleDevice: RxBleDevice) {

        bleDevice.establishConnection(false)
                .flatMapSingle({ rxBleConnection -> rxBleConnection.readCharacteristic(UUID_TO_READ) })
                .subscribe(
                        { characteristicValue ->
                            // Read characteristic value.
                        },
                        { throwable ->
                            // Handle an error here.
                        }
                )
    }

    override fun onDestroy() {
        super.onDestroy()

        // When done, just dispose.
        //scanSubscription.dispose()
        deviceConnectionSubsription.dispose()
    }

}
