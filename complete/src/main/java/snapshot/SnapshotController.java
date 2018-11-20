package snapshot;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class SnapshotController {


    @MessageMapping("/snapshot")
    @SendTo("/stream/snapshots")
    public Snapshot snapshot(SnapshotData image) throws Exception {
        // Thread.sleep(1000); // simulated delay
        // return new Greeting("Hello, " + HtmlUtils.htmlEscape(message.getName()) + "!");
        return new Snapshot(image.getData());
    }

}
