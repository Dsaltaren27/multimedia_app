package com.widget.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.os.Handler;
import android.widget.RemoteViews;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.AppWidgetTarget;

import io.ionic.starter.R;

public class MyWidget extends AppWidgetProvider {

  static Handler handler = new Handler();
  static Runnable runnable;

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    final RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.my_widget_layout);
    final ComponentName thisWidget = new ComponentName(context, MyWidget.class);
    final AppWidgetTarget appWidgetTarget = new AppWidgetTarget(context, R.id.widget_image, views, thisWidget);

    runnable = new Runnable() {
      @Override
      public void run() {
        android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String description = prefs.getString("description", "Sin descripción");
        String imageUrl = prefs.getString("imageUrl", "");

        views.setTextViewText(R.id.widget_text, description);

        android.util.Log.d("MyWidget", "Image URL from prefs: " + imageUrl);

        if (!imageUrl.isEmpty()) {
          Glide.with(context.getApplicationContext())
            .asBitmap()
            .load(imageUrl)
            .into(appWidgetTarget);
        }

        appWidgetManager.updateAppWidget(thisWidget, views);
        handler.postDelayed(this, 5000);
      }
    };

    handler.post(runnable);
  }

  @Override
  public void onDisabled(Context context) {
    handler.removeCallbacks(runnable);
  }
}
