package com.deepfoundation.deep;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import ru.deep.contacts.CallHistory;

package com.deepfoundation.deep;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ru.deep.contacts.CallHistory;
import com.capacitor.preferences.Preferences;
import java.util.ArrayList;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            add(CallHistory.class);
            add(Preferences.class);
        }});
    }
}
