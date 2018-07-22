package com.b3nedikt.moby

import android.Manifest
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
import java.util.*


class MainActivity : AppCompatActivity() {

    companion object {
        val TAG = "MainActivity"

        val UUID_TO_WRITE = UUID.randomUUID()
        val UUID_TO_READ = UUID.randomUUID()
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


        /*
        val json = """
            [{ "Name":"Bob the Builder", "Depth": "3"},
        { "Birthday":"13-11-1992", "Depth":"3"},
        { "ExpireDate":"06-03-2021", "Depth":"3"},
        { "Driving":"Car", "Depth":"3"},
        { "License Number":"DE1001001", "Depth":"3"},
        { "City":"Munich", "Depth":"3"}
        ]
        """
        */
        val json = """
            %5B%7B%22Name%22%3A%22Jelle%20Femmo%22%2C%22Surname%22%3A%22Millenaar%22%2C%22Birthday%22%3A%2213-11-1992%22%2C%22StartDate%22%3A%2203-06-2011%22%2C%22ExpireDate%22%3A%2203-06-2021%22%7D%5D
            """

        khttp.post(
                url = "http://httpbin.org/post",
                json = json)
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

        deviceConnectionSubsription = device.establishConnection(false) // <-- autoConnect flag
                .subscribe(
                        { rxBleConnection ->
                            // All GATT operations are done through the rxBleConnection.

                            Log.wtf(TAG, "Connected")
                            writeToDevice(device, byteArrayOf(12,12,15))
                        },
                        { throwable ->
                            // Handle an error here.
                            throwable.printStackTrace()
                        }
                )
    }

    private fun writeToDevice(bleDevice: RxBleDevice, bytesToWrite: ByteArray) {

        val writeConnection = bleDevice.establishConnection(false)
                .flatMapSingle({ rxBleConnection -> rxBleConnection.writeCharacteristic(UUID_TO_WRITE, bytesToWrite) })
                .subscribe(
                        { characteristicValue ->
                            // Characteristic value confirmed.


                        },
                        { throwable ->
                            // Handle an error here.
                        }
                )
    }

    private fun readFromBleDevice(bleDevice: RxBleDevice){

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
