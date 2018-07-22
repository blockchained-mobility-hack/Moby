package com.b3nedikt.moby

import android.os.Bundle
import android.os.Handler
import android.support.v7.app.AppCompatActivity
import com.b3nedikt.moby.R.id.unlockImage
import pl.droidsonroids.gif.GifDrawable

class UnlockActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_unlock)

        val unlockDrawable = GifDrawable(resources, R.drawable.splash_screen);
        //unlockImage.setI

        Handler().postDelayed({ unlockDrawable.stop() }, 1200)
    }
}