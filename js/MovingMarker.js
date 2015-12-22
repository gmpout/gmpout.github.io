1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
L.interpolatePosition = function(p1, p2, duration, t) {
    var k = t/duration;
    k = (k>0) ? k : 0;
    k = (k>1) ? 1 : k;
    return L.latLng(p1.lat + k*(p2.lat-p1.lat), p1.lng + k*(p2.lng-p1.lng));
};
 
L.Marker.MovingMarker = L.Marker.extend({
 
    //state constants
    statics: {
        notStartedState: 0,
        endedState: 1,
        pausedState: 2,
        runState: 3
    },
 
    options: {
        autostart: false,
        loop: false,
    },
 
    initialize: function (latlngs, durations, options) {
        L.Marker.prototype.initialize.call(this, latlngs[0], options);
 
        this._latlngs = latlngs.map(function(e, index) {    
            return L.latLng(e);
        });
        this._durations = durations;
        this._backupDurations = [];
        this._currentDuration = 0;
        this._currentIndex = 0;
 
        this._state = L.Marker.MovingMarker.notStartedState;
        this._startTime = 0;
        this._startTimeStamp = 0;
        this._pauseStartTime = 0;
        this._animId = 0;
        this._animRequested = false;
        this._currentLine = [];
    },
     
     
 
    isRunning: function() {
        return this._state === L.Marker.MovingMarker.runState;
    },
 
    isEnded: function() {
        //this.resetDurations()
        return this._state === L.Marker.MovingMarker.endedState;
    },
 
    isStarted: function() {
        return this._state !== L.Marker.MovingMarker.notStartedState;
    },
 
    isPaused: function() {
        return this._state === L.Marker.MovingMarker.pausedState;
    },
 
    start: function() {
        if (this.isRunning()) {
            return;
        }
 
        if (this.isPaused()) {
            this.resume();
             
        } else {
            this._loadLine(0);
            this._startAnimation();
            this.fire('start');
        } 
    },
 
    resume: function() {
        if (! this.isPaused()) {
            return;
        }
        // update the current line
        this._currentLine[0] = this.getLatLng(); 
        this._currentDuration -= (this._pauseStartTime - this._startTime);
 
        this._startAnimation();
    },
     
    backupDurations: function() {
        var newArray = []
        for (var n = 0; n < this._durations.length; n++) {
            newArray.push(this._durations[n]);
        }
        this._backupDurations = newArray
    },
     
    resetDurations: function() {
        console.log("reseting")
        //this._currentIndex = 0
        //this._currentLine[0] = this.getLatLng();
        this._currentDuration =  0;
          
        for (var n = 0; n < this._backupDurations.length; n++) {
            this._durations[n] = this._backupDurations[n]
        }
    },
 
 
    updateTimeNext: function(nextStation,latlng) {
        //this._loadLine(0);
        ;
        this._stopAnimation()
 
        //THIS WAY ONLY  examble this._durations[from 1 to 5] = 0
        //console.log(nextStation);
         
        //this._loadLine(0)
        //this._currentIndex = nextStation-1
        //_latlngs
        //this._currentLine[nextStation] = this._latlngs; 
        for (var k = 0; k < nextStation; k++) {
            this._durations[k] = 0
        }
        this._durations[nextStation]= 1000
        //this._durations[nextStation-1]= 1000
        //this._durations[nextStation-1] = 1000
        for (var k = 0; k < this._durations.length; k++) {
            //console.log(this._durations[k] +" key: "+ k)
        }
        if (this.isRunning()) {
             
            this._currentDuration = 0;
            this._loadLine(0);
            this._startAnimation();
        } else {
             
            this._currentDuration = 0;
            this.setLatLng(L.latLng(latlng))
        }
         
         
        this._currentLine[0] = L.latLng(latlng); 
    },
 
    updateTimePrevious: function(previouStation,latlng) {
        this._stopAnimation()
         
        //this._currentIndex = previouStation-1;
        //console.log("currentLine: "+this._currentLine)
         
        //this._durations[previouStation-1] = 1000
        for (var k = 0; k < this._durations.length; k++) {
             
            if (previouStation <= k) {
                this._durations[k] = this._backupDurations[k];
            } else {
                this._durations[k] = 0;
            }
             
        }
        //this._durations[previouStation-1] = 1000
        this._durations[previouStation] = 1000
         
        for (var k = 0; k < this._durations.length; k++) {
           // console.log(this._durations[k] +" key: "+ k)
        }
         
        if (this.isRunning()) {
             
            this._currentDuration = 0;
            this._loadLine(0);
            this._startAnimation();
        } else {
            this._currentDuration = 0;
            this._loadLine(0);
            this.setLatLng(L.latLng(latlng))
        }
 
        this._currentLine[0] = L.latLng(latlng); 
    },
 
 
    addLatLng: function(latlng, duration) {
        this._latlngs.push(L.latLng(latlng));
        this._durations.push(duration);
    },
 
    moveTo: function(latlng, duration) {
        this._stopAnimation();
        this._latlngs = [this.getLatLng(), L.latLng(latlng)];
        this._durations = [duration];
        this._state = L.Marker.MovingMarker.notStartedState;
        this.start();
        this.options.loop = false;
    },
 
    addStation: function(pointIndex, duration) {
        if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
            return;
        }
        var t = this._latlngs[pointIndex];
        this._latlngs.splice(pointIndex + 1, 0, t);
        this._durations.splice(pointIndex, 0, duration);
    },
 
    _startAnimation: function() {
        this._startTime = Date.now();
        this._state = L.Marker.MovingMarker.runState;
        this._animId = L.Util.requestAnimFrame(function(timestamp) {
            this._startTimeStamp = timestamp;
            this._animate(timestamp);
        }, this, true );
        this._animRequested = true;
    },
 
    _resumeAnimation: function() {
        if (! this._animRequested) {
            this._animId = L.Util.requestAnimFrame(function(timestamp) {
                this._animate(timestamp);
            }, this, true );
        }
    },
 
    _stopAnimation: function() {
        if (this._animRequested) {
            L.Util.cancelAnimFrame(this._animId);
            this._animRequested = false;
        }
    },
 
    _loadLine: function(index) {
        this._currentIndex = index;
        this._currentDuration = this._durations[index];
        this._currentLine = this._latlngs.slice(index, index + 2);
    },
 
    /**
     * Load the line where the marker is
     * @param  {Number} timestamp
     * @return {Number} elapsed time on the current line or null if
     * we reached the end or marker is at a station
     */
    _updateLine: function(timestamp) {
        //time elapsed since the last latlng
        var elapsedTime = timestamp - this._startTimeStamp;
 
        // not enough time to update the line
        if (elapsedTime <= this._currentDuration) {
            return elapsedTime;
        }
 
        var lineIndex = this._currentIndex;
        var lineDuration = this._currentDuration;
 
        while (elapsedTime > lineDuration) {
            //substract time of the current line
            elapsedTime -= lineDuration;
            lineIndex++;
 
            // test if we have reached the end of the polyline
            if (lineIndex >= this._latlngs.length - 1) {
 
                if (this.options.loop) {
                    lineIndex = 0;
                    this.fire('loop', {elapsedTime: elapsedTime});                        
                } else {
                    // place the marker at the end, else it would be at 
                    // the last position
                    this.setLatLng(this._latlngs[this._latlngs.length-1]);
                    this.stop(elapsedTime);
                    return null;
                }
            }
            lineDuration = this._durations[lineIndex];
        }
 
        this._loadLine(lineIndex);
        this._startTimeStamp = timestamp - elapsedTime;
        this._startTime = Date.now() - elapsedTime;
        return elapsedTime;
    },
 
    _animate: function(timestamp, noRequestAnim) {
        // compute the time elapsed since the start of the line
        var elapsedTime; 
        this._animRequested = false;
 
        //find the next line and compute the new elapsedTime
        elapsedTime = this._updateLine(timestamp);
 
        if (elapsedTime === null) {
            //we have reached the end
            return;
        }
 
        // compute the position
        var p = L.interpolatePosition(this._currentLine[0],
                                      this._currentLine[1],
                                      this._currentDuration,
                                      elapsedTime);
        this.setLatLng(p);
 
        if (! noRequestAnim) {
            this._animId = L.Util.requestAnimFrame(this._animate, this, false);
            this._animRequested = true;
        }
    },
 
    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);
 
        if (this.options.autostart && (! this.isStarted())) {
            this.start();
            return;
        }
 
        if (this.isRunning()) {
            this._resumeAnimation();
        }
    },
 
    onRemove: function(map) {
        L.Marker.prototype.onRemove.call(this, map);
        this._stopAnimation();
    },
 
    pause: function() {
        if (! this.isRunning()) {
            return;
        }
 
        this._pauseStartTime = Date.now();
        this._state = L.Marker.MovingMarker.pausedState;
        this._stopAnimation();
        //force animation to place the marker at the right place
        this._animate(this._startTimeStamp
                      + (this._pauseStartTime - this._startTime), true);
    },
 
    stop: function(elapsedTime) {
        if (this.isEnded()) {
            return;
        }
 
        this._stopAnimation();
 
        if (typeof(elapsedTime) === 'undefined') {
            //user call
            elapsedTime = 0;
            // force animation to place the marker at the right place
            this._animate(this._startTimeStamp
                          + (Date.now() - this._startTime), true);
        }
 
        this._state = L.Marker.MovingMarker.endedState;
        this.fire('end', {elapsedTime: elapsedTime});
    }
});
 
L.Marker.movingMarker = function (latlngs, duration, options) {
    return new L.Marker.MovingMarker(latlngs, duration, options);
};