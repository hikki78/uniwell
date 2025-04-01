import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Settings, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface WellnessSettingsProps {
  userId: string;
  onSettingsChange: () => void;
}

interface SettingsData {
  screenTimeLimit: number;
  waterIntakeGoal: number;
  meditationGoal: number;
  sleepGoal: number;
  exerciseGoal: number;
  readingGoal: number;
}

interface CustomHabit {
  id: string;
  name: string;
  target: number;
  current: number;
  streak: number;
  active: boolean;
  weightInScore: number;
}

export function WellnessSettings({ userId, onSettingsChange }: WellnessSettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    screenTimeLimit: 480, // 8 hours in minutes
    waterIntakeGoal: 2000,
    meditationGoal: 10,
    sleepGoal: 8,
    exerciseGoal: 30,
    readingGoal: 20
  });
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([]);
  const [newHabit, setNewHabit] = useState({ name: "", target: 0, weightInScore: 10 });
  const [loading, setLoading] = useState(false);

  // Fetch settings when dialog opens
  useEffect(() => {
    if (open && userId) {
      fetchSettings();
      fetchCustomHabits();
    }
  }, [open, userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard/settings?userId=${userId}`);
      if (response.data) {
        setSettings({
          screenTimeLimit: response.data.screenTimeLimit,
          waterIntakeGoal: response.data.waterIntakeGoal,
          meditationGoal: response.data.meditationGoal,
          sleepGoal: response.data.sleepGoal,
          exerciseGoal: response.data.exerciseGoal,
          readingGoal: response.data.readingGoal
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomHabits = async () => {
    try {
      const response = await axios.get(`/api/dashboard/habits?userId=${userId}`);
      if (response.data) {
        setCustomHabits(response.data);
      }
    } catch (error) {
      console.error("Error fetching custom habits:", error);
      toast.error("Failed to load custom habits");
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/dashboard/settings?userId=${userId}`, settings);
      toast.success("Settings saved successfully");
      onSettingsChange();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const addCustomHabit = async () => {
    if (!newHabit.name || newHabit.target <= 0) {
      toast.error("Please provide a name and a target value greater than 0");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/dashboard/habits?userId=${userId}`, newHabit);
      setNewHabit({ name: "", target: 0, weightInScore: 10 });
      toast.success("Custom habit added");
      fetchCustomHabits();
      onSettingsChange();
    } catch (error) {
      console.error("Error adding custom habit:", error);
      toast.error("Failed to add custom habit");
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/dashboard/habits?habitId=${habitId}`);
      toast.success("Habit removed");
      fetchCustomHabits();
      onSettingsChange();
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SettingsData, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wellness Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize your wellness goals and habits
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Daily Goals</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="screenTimeLimit">Screen Time Limit (hours)</Label>
                  <span>{settings.screenTimeLimit / 60}h</span>
                </div>
                <Slider 
                  id="screenTimeLimit"
                  min={60} 
                  max={1440} 
                  step={30} 
                  value={[settings.screenTimeLimit]} 
                  onValueChange={(value) => handleSettingChange('screenTimeLimit', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="waterIntakeGoal">Water Intake Goal (ml)</Label>
                  <span>{settings.waterIntakeGoal}ml</span>
                </div>
                <Slider 
                  id="waterIntakeGoal"
                  min={500} 
                  max={5000} 
                  step={100} 
                  value={[settings.waterIntakeGoal]} 
                  onValueChange={(value) => handleSettingChange('waterIntakeGoal', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="meditationGoal">Meditation Goal (minutes)</Label>
                  <span>{settings.meditationGoal}min</span>
                </div>
                <Slider 
                  id="meditationGoal"
                  min={1} 
                  max={60} 
                  step={1} 
                  value={[settings.meditationGoal]} 
                  onValueChange={(value) => handleSettingChange('meditationGoal', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="sleepGoal">Sleep Goal (hours)</Label>
                  <span>{settings.sleepGoal}h</span>
                </div>
                <Slider 
                  id="sleepGoal"
                  min={4} 
                  max={12} 
                  step={0.5} 
                  value={[settings.sleepGoal]} 
                  onValueChange={(value) => handleSettingChange('sleepGoal', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="exerciseGoal">Exercise Goal (minutes)</Label>
                  <span>{settings.exerciseGoal}min</span>
                </div>
                <Slider 
                  id="exerciseGoal"
                  min={5} 
                  max={120} 
                  step={5} 
                  value={[settings.exerciseGoal]} 
                  onValueChange={(value) => handleSettingChange('exerciseGoal', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="readingGoal">Reading Goal (minutes)</Label>
                  <span>{settings.readingGoal}min</span>
                </div>
                <Slider 
                  id="readingGoal"
                  min={5} 
                  max={120} 
                  step={5} 
                  value={[settings.readingGoal]} 
                  onValueChange={(value) => handleSettingChange('readingGoal', value[0])}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custom Habits</h3>
            
            <div className="space-y-3">
              {customHabits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                  <div>
                    <p className="font-medium">{habit.name}</p>
                    <p className="text-sm text-muted-foreground">Target: {habit.target} | Weight: {habit.weightInScore}%</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Add New Habit</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="habitName">Habit Name</Label>
                    <Input 
                      id="habitName"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                      placeholder="e.g., Drink herbal tea"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="habitTarget">Target Value</Label>
                    <Input 
                      id="habitTarget"
                      type="number"
                      min={1}
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 2 cups"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label htmlFor="habitWeight">Weight in Wellness Score (%)</Label>
                      <span>{newHabit.weightInScore}%</span>
                    </div>
                    <Slider 
                      id="habitWeight"
                      min={1} 
                      max={30} 
                      step={1} 
                      value={[newHabit.weightInScore]} 
                      onValueChange={(value) => setNewHabit({...newHabit, weightInScore: value[0]})}
                    />
                  </div>
                  
                  <Button 
                    onClick={addCustomHabit} 
                    className="w-full"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Habit
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveSettings} disabled={loading}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
