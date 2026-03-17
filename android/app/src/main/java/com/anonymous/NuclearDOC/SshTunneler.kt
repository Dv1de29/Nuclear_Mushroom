package com.anonymous.NuclearDOC

import android.util.Log
import com.jcraft.jsch.ChannelExec
import com.jcraft.jsch.JSch
import com.jcraft.jsch.Session
import java.io.ByteArrayOutputStream
import java.util.Properties

object SshTunneler {

    fun executeCommand(user: String, host: String, port: Int, command: String): String {
        var session: Session? = null
        try {
            val jsch = JSch()
            session = jsch.getSession(user, host, port)
            session?.setPassword("#Start#S3rv3r#105!)%")

            val config = Properties()
            config.put("StrictHostKeyChecking", "no")
            session?.setConfig(config)

            Log.d("SshTunneler", "Connecting to $host...")
            session?.connect(5000)

            if (session?.isConnected == true) {
                val channel = session?.openChannel("exec") as ChannelExec
                channel.setCommand(command)

                val outputStream = ByteArrayOutputStream()
                channel.outputStream = outputStream
                
                channel.connect()

                while (!channel.isClosed) {
                    Thread.sleep(100)
                }

                channel.disconnect()
                session?.disconnect()

                return outputStream.toString()
            }

        } catch (e: Exception) {
            Log.e("SshTunneler", "Error", e)
            return "Error: ${e.message}"
        }
        return "Failed to connect"
    }
}