import type { Project } from '../types/project';
import { formatDateToISO } from './dates';

export function generateSampleProjects(): Project[] {
  const now = new Date();

  // Project 1: Active Fire Damage Repair (Created 2 weeks ago, Due in 3 weeks)
  const d1Created = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const d1Due = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  // Project 2: Active Addition/Renovation (Due in 4 days - Due This Week)
  const d2Created = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d2Due = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  // Project 3: Past Due Water Damage Repair (Created 35 days ago, Due 5 days ago)
  const d3Created = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const d3Due = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Project 4: Completed New Construction
  const d4Created = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const d4Due = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const sampleDateTask = formatDateToISO(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000));

  return [
    {
      id: 'proj-101',
      projectNo: '12345',
      projectName: 'Smith Residence',
      template: 'Fire Damage Repair',
      createdDate: formatDateToISO(d1Created),
      dueDate: formatDateToISO(d1Due),
      completed: false,
      collapsedSections: { tasks: false, notes: false },
      taskList: [
        { id: 't-1', text: 'Notify Chris for Permitting', completed: true },
        { id: 't-2', text: 'APS signed & Marketing Time Moved', completed: true },
        { id: 't-3', text: 'Retainer Paid', completed: true },
        {
          id: 't-4',
          text: 'Site Visit Scheduled',
          completed: false,
          dueDate: sampleDateTask,
        },
        { id: 't-5', text: 'Site Visit Completed', completed: false },
        { id: 't-6', text: 'Draft Initial Floor Plans', completed: false },
        { id: 't-7', text: 'Drawing Redmarks & Notes', completed: false },
        { id: 't-8', text: 'PIC Review', completed: false },
      ],
      notesLog: [
        {
          id: 'n-1',
          timestamp: '08/10/2026 9:30 AM',
          text: 'Initial insurance adjuster review completed. Structural framing assessment underway.',
        },
        {
          id: 'n-2',
          timestamp: '08/15/2026 2:15 PM',
          text: 'Client approved elevation revisions.',
        },
      ],
    },
    {
      id: 'proj-102',
      projectNo: '12389',
      projectName: 'Oak Ridge Custom Addition',
      template: 'Addition/Renovation',
      createdDate: formatDateToISO(d2Created),
      dueDate: formatDateToISO(d2Due),
      completed: false,
      collapsedSections: { tasks: false, notes: false },
      taskList: [
        { id: 't-201', text: 'Notify Chris for Permitting', completed: true },
        { id: 't-202', text: 'APS signed & Marketing Time Moved', completed: true },
        { id: 't-203', text: 'Retainer Paid', completed: true },
        { id: 't-204', text: 'Site Visit Scheduled', completed: true },
        { id: 't-205', text: 'Site Visit Completed', completed: true },
        { id: 't-206', text: 'Draft Initial Floor Plans', completed: true },
        { id: 't-207', text: 'Drawing Redmarks & Notes', completed: false },
        { id: 't-208', text: 'PIC Review', completed: false },
      ],
      notesLog: [
        {
          id: 'n-201',
          timestamp: '08/02/2026 11:00 AM',
          text: 'Permit application submitted to city zoning department.',
        },
      ],
    },
    {
      id: 'proj-103',
      projectNo: '12410',
      projectName: 'Harbor Point Water Restoration',
      template: 'Water Damage Repair',
      createdDate: formatDateToISO(d3Created),
      dueDate: formatDateToISO(d3Due),
      completed: false,
      collapsedSections: { tasks: true, notes: true },
      taskList: [
        { id: 't-301', text: 'Notify Chris for Permitting', completed: true },
        { id: 't-302', text: 'APS signed & Marketing Time Moved', completed: true },
        { id: 't-303', text: 'Retainer Paid', completed: false },
        { id: 't-304', text: 'Site Visit Scheduled', completed: false },
        { id: 't-305', text: 'Site Visit Completed', completed: false },
      ],
      notesLog: [
        {
          id: 'n-301',
          timestamp: '07/28/2026 4:45 PM',
          text: 'Dehumidification equipment deployed in basement and lower level.',
        },
      ],
    },
    {
      id: 'proj-104',
      projectNo: '12204',
      projectName: 'Highland Park Luxury Villa',
      template: 'New Construction',
      createdDate: formatDateToISO(d4Created),
      dueDate: formatDateToISO(d4Due),
      completed: true,
      completedDate: formatDateToISO(new Date()),
      collapsedSections: { tasks: true, notes: true },
      taskList: [
        { id: 't-401', text: 'Notify Chris for Permitting', completed: true },
        { id: 't-402', text: 'APS signed & Marketing Time Moved', completed: true },
        { id: 't-403', text: 'Retainer Paid', completed: true },
        { id: 't-404', text: 'Site Visit Scheduled', completed: true },
        { id: 't-405', text: 'Site Visit Completed', completed: true },
        { id: 't-406', text: 'Draft Initial Floor Plans', completed: true },
        { id: 't-407', text: 'Drawing Redmarks & Notes', completed: true },
        { id: 't-408', text: 'PIC Review', completed: true },
      ],
      notesLog: [
        {
          id: 'n-401',
          timestamp: '07/10/2026 10:00 AM',
          text: 'Final building inspection passed. Certificate of Occupancy issued.',
        },
      ],
    },
  ];
}

export const INITIAL_NOTEPAD_CONTENT = `<h3>Daily Construction & Field Notes</h3>
<p><strong>Reminders:</strong></p>
<ul>
  <li>Confirm structural engineer signoff on Smith Residence beam specs</li>
  <li>Pick up updated architectural prints from municipal planning office</li>
  <li>Review subcontractor drywall estimate for Harbor Point</li>
</ul>
<p><strong>Subcontractor Contacts:</strong></p>
<ol>
  <li>Electrician: Mike (555-0192)</li>
  <li>Plumbing: Dave (555-0144)</li>
  <li>Permit Coordinator: Chris</li>
</ol>`;
