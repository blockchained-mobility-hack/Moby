package com.b3nedikt.moby

import android.os.Bundle
import android.os.Handler
import android.support.v7.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_unlock.*
import pl.droidsonroids.gif.GifDrawable

class UnlockActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_unlock)

        val unlockDrawable = GifDrawable(resources, R.drawable.unlock);
        unlockImage.setImageDrawable(unlockDrawable)

        Handler().postDelayed({ unlockDrawable.stop() }, 1200)
    }
}