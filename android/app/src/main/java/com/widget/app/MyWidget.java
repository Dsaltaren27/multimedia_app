package com.widget.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.os.Handler;
import android.widget.RemoteViews;

import io.ionic.starter.R;

public class MyWidget extends AppWidgetProvider {

  static Handler handler = new Handler();
  static Runnable runnable;

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    final RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.my_widget_layout);

    runnable = new Runnable() {
      @Override
      public void run() {
        // Aquí deberías usar Preferences (ver paso 2)
        // Pero Preferences está disponible desde el lado de la app
        // Así que usaremos SharedPreferences (mismo almacenamiento)
        android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String description = prefs.getString("description", "Sin descripción");
        String imageUrl = prefs.getString("imageUrl", "");

        views.setTextViewText(R.id.widget_text, description);
        // No se puede cargar imagen remota directamente, necesitarás usar Glide o similar

        appWidgetManager.updateAppWidget(new ComponentName(context, MyWidget.class), views);
        handler.postDelayed(this, 5000); // refrescar cada 5 segundos
      }
    };

    handler.post(runnable);
  }

  @Override
  public void onDisabled(Context context) {
    handler.removeCallbacks(runnable);
  }
}
