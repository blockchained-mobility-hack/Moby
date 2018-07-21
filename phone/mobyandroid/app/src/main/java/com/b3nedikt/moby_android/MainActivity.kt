package com.b3nedikt.moby_android

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.util.Log
import com.polidea.rxandroidble2.RxBleClient
import com.polidea.rxandroidble2.RxBleConnection
import com.polidea.rxandroidble2.RxBleDevice
import com.polidea.rxandroidble2.scan.ScanSettings
import io.reactivex.Observable
import io.reactivex.disposables.Disposable
import kotlinx.android.synthetic.main.activity_main.*
import java.util.*

class MainActivity : AppCompatActivity() {

    companion object {
        val TAG = "MainActivity"

        val UUID_TO_WRITE = UUID.randomUUID()
        val UUID_TO_READ = UUID.randomUUID()
    }

    val devices = arrayOf<String>()

    private var device = RxBleClient.create(this)

    private lateinit var scanSubscription: Disposable
    private lateinit var deviceConnectionSubsription: Disposable

    private val PERMISSIONS_REQUEST_LOCATION: Int = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        bleDevicesRecyclerView.adapter = MyAdapter(devices)

        // Here, thisActivity is the current activity
        if (ContextCompat.checkSelfPermission(this,
                        Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    PERMISSIONS_REQUEST_LOCATION)
        } else {
            // Permission has already been granted
        }

        val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
        val REQUEST_ENABLE_BT = 1
        this.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT)

        //scanForBleDevice()
    }

    private fun scanForBleDevice() {
        scanSubscription = device.scanBleDevices(
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

        val macAddress = "AA:BB:CC:DD:EE:FF"
        val device = device.getBleDevice(macAddress)

        deviceConnectionSubsription = device.establishConnection(false) // <-- autoConnect flag
                .subscribe(
                        { rxBleConnection ->
                            // All GATT operations are done through the rxBleConnection.

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
        scanSubscription.dispose()
    }

    /*
        private fun writeToDevice(connection: Observable<RxBleConnection>, bytesToWrite: ByteArray) {
        connection.flatMapSingle({ rxBleConnection -> rxBleConnection.writeCharacteristic(UUID_TO_WRITE, bytesToWrite) })
                .subscribe(
                        { characteristicValue ->
                            // Characteristic value confirmed.


                        },
                        { throwable ->
                            // Handle an error here.
                        }
                )
    }
     */
}